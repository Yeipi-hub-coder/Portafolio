
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


/* ── 2. CANVAS PARTÍCULAS DE FONDO ──────────────────────────
   Partículas flotantes suaves con conexiones
   ─────────────────────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CONFIG = {
    PARTICLE_COUNT: 70,    // Cantidad de partículas
    CONNECT_DIST: 130,     // Distancia máxima de conexión
    SPEED: 0.35,           // Velocidad de movimiento
    MIN_SIZE: 1,           // Tamaño mínimo
    MAX_SIZE: 2.5,         // Tamaño máximo
    COLOR: '96, 195, 255', // Color RGB de partículas
  };

  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function Particle() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * CONFIG.SPEED;
    this.vy = (Math.random() - 0.5) * CONFIG.SPEED;
    this.r  = CONFIG.MIN_SIZE + Math.random() * (CONFIG.MAX_SIZE - CONFIG.MIN_SIZE);
    this.alpha = 0.2 + Math.random() * 0.5;
  }

  function init() {
    particles = Array.from({ length: CONFIG.PARTICLE_COUNT }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Fondo con gradiente radial suave (oscuro al centro)
    const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
    grad.addColorStop(0,   'rgba(10, 22, 40, 0.0)');
    grad.addColorStop(1,   'rgba(6,  13, 31, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Mover y dibujar partículas
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Rebote en bordes
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;

      // Punto
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.COLOR}, ${p.alpha})`;
      ctx.fill();

      // Líneas de conexión
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.CONNECT_DIST) {
          const opacity = (1 - dist / CONFIG.CONNECT_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${CONFIG.COLOR}, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  init();
  draw();
  window.addEventListener('resize', () => { resize(); });
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