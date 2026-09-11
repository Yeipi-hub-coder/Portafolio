
/* ── 1. TYPEWRITER  ────────────────────────────────────────── */
const roles = [
  'Desarrollador Web',       // Rol 1
  'Automatizador de Procesos', // Rol 2
  'Diseñador UI/UX',          // Rol 3
  'Problem Solver',            // Rol 4
];

(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  let roleIdx = 0, charIdx = 0, deleting = false;
  const SPEED_TYPE = 80, SPEED_DEL = 40, PAUSE = 1800;

  function tick() {
    const word = roles[roleIdx];

    if (!deleting) {
      el.textContent = word.slice(0, ++charIdx);
      if (charIdx === word.length) {
        deleting = true;
        setTimeout(tick, PAUSE);
        return;
      }
    } else {
      el.textContent = word.slice(0, --charIdx);
      if (charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
      }
    }

    setTimeout(tick, deleting ? SPEED_DEL : SPEED_TYPE);
  }

  // Inicia con un pequeño delay para que la animación de entrada termine
  setTimeout(tick, 1400);
})();


/* ── 2. CANVAS DE FONDO: LÍNEAS DE ENERGÍA (antes: partículas tipo estrellas)
   Ondas suaves que fluyen horizontalmente, con los mismos colores
   de la paleta (blue-electric, accent, blue-glow). Sin puntos sueltos,
   para que no se lea como un "cielo estrellado".
   ─────────────────────────────────────────────────────────── */
(function initWaves() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Cada onda: color, amplitud, longitud de onda, velocidad, grosor y altura relativa
  const WAVES = [
    { color: '45, 140, 240',  amp: 46, len: 0.0032, speed: 0.012, width: 1.6, yRatio: 0.30, alpha: 0.22 },
    { color: '0, 229, 255',   amp: 34, len: 0.0045, speed: -0.018, width: 1.3, yRatio: 0.52, alpha: 0.18 },
    { color: '96, 195, 255',  amp: 58, len: 0.0022, speed: 0.009, width: 2,   yRatio: 0.74, alpha: 0.15 },
    { color: '0, 229, 255',   amp: 26, len: 0.006,  speed: -0.024, width: 1,   yRatio: 0.88, alpha: 0.12 },
  ];

  let W, H, t = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function drawWave(wave) {
    const { color, amp, len, speed, width, yRatio, alpha } = wave;
    const baseY = H * yRatio;

    ctx.beginPath();
    for (let x = 0; x <= W; x += 6) {
      const y = baseY + Math.sin(x * len + t * speed) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${color}, ${alpha})`;
    ctx.lineWidth = width;
    ctx.shadowColor = `rgba(${color}, ${alpha * 1.4})`;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    WAVES.forEach(drawWave);
    t += 1;
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
})();


/* ── 3. SIDEBAR MÓVIL ────────────────────────────────────────
   Maneja la apertura/cierre del sidebar en pantallas móviles.
   ─────────────────────────────────────────────────────────── */
(function initSidebar() {
  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebar-overlay');

  function openMenu() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  // Cerrar al hacer clic en un enlace de nav (mobile)
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) closeMenu();
    });
  });
})();


/* ── 4. RESALTADO ACTIVO DEL MENÚ + SCROLL SUAVE ────────────
   Usa IntersectionObserver para detectar qué sección es
   visible y marcarla como activa en el sidebar.
   ─────────────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function setActive(id) {
    navLinks.forEach(link => {
      const isActive = link.dataset.section === id;
      link.classList.toggle('active', isActive);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    {
      root: null,
      threshold: 0.35,
      rootMargin: '-60px 0px -35% 0px',
    }
  );

  sections.forEach(sec => observer.observe(sec));

  // Scroll suave al hacer clic en los links del sidebar
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const targetId  = link.getAttribute('href');
      const targetEl  = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();


/* ── 5. REVEAL AL SCROLL (IntersectionObserver) ──────────────
   Elementos con clase "reveal-up" se animan al entrar
   en el viewport.
   ─────────────────────────────────────────────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal-up');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Dejar de observar para no repetir la animación
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  els.forEach(el => observer.observe(el));
})();


/* ── 6. BARRAS DE PROGRESO (lenguajes) ───────────────────────
   Anima las barras al entrar en el viewport.
   ─────────────────────────────────────────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach(bar => observer.observe(bar));
})();


/* ── 7. CONTADOR ANIMADO (estadísticas) ──────────────────────
   Anima los números en la sección "Quién Soy".
   ─────────────────────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  function animateCounter(el) {
    const target   = +el.dataset.target;
    const duration = 1600; // ms
    const step     = target / (duration / 16);
    let current    = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 16);
  }

  counters.forEach(c => observer.observe(c));
})();


/* ── 8. EFECTO PARALLAX SUAVE EN EL HERO ─────────────────────
   El avatar de héroe se mueve levemente al mover el ratón.
   ─────────────────────────────────────────────────────────── */
(function initParallax() {
  const heroSection = document.getElementById('inicio');
  const heroAvatar  = heroSection?.querySelector('.hero-avatar-wrapper');
  if (!heroAvatar) return;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;   // -1 a 1
    const dy = (e.clientY - cy) / cy;   // -1 a 1

    heroAvatar.style.transform = `translate(${dx * 8}px, ${dy * 6}px)`;
  });
})();


/* ── 9. GLOW DE LAS TARJETAS AL MOVER RATÓN ─────────────────
   Efecto de luz dinámica al mover el cursor sobre tarjetas.
   ─────────────────────────────────────────────────────────── */
(function initCardGlow() {
  const cards = document.querySelectorAll('.glass-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
    });
  });
})();


/* ── 10. FOTO DE PERFIL: soporte para imagen local ───────────
   Si el usuario reemplaza las imágenes de placeholder,
   este bloque sirve como fallback en caso de error.
   ─────────────────────────────────────────────────────────── */
(function initAvatarFallback() {
  const FALLBACK = 'https://ui-avatars.com/api/?name=JP&background=0d2a52&color=60c3ff&size=220&bold=true';

  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.src = FALLBACK;
    });
  });
})();