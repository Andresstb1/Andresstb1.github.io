/**
 * ARCHIVO PRINCIPAL DE CONTROLADORES E INTERACTIVIDAD
 * Configurado con GSAP ScrollTrigger, Fallback de Autoplay y Micro-interacciones.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Comprobación de preferencia de accesibilidad reducida
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initVideoAutoplayFallback();

  if (!prefersReducedMotion) {
    initCustomCursor();
    initGSAPAnimations();
    initTextScramble();
    initCardGlow();
  } else {
    // Si el usuario solicitó movimiento reducido, hacer visibles los elementos de inmediato
    document.querySelectorAll('.hero-elem').forEach(el => el.style.opacity = '1');
  }
});

/* ==========================================================================
   1. MANEJO RESISTENTE DE AUTOPLAY DE VÍDEO
   Evita bloqueos de directiva en iOS Safari y navegadores Android
   ========================================================================== */
function initVideoAutoplayFallback() {
  const video = document.getElementById('hero-video');
  if (!video) return;

  const playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      console.warn('[Video Engine] Autoplay bloqueado por políticas del agente de usuario. Aplicando fallback de visualización estática.');
      // El atributo 'poster' en la etiqueta <video> ya garantiza la cobertura visual
      video.controls = false;
    });
  }
}

/* ==========================================================================
   2. CURSOR PERSONALIZADO Y EFECTO MAGNÉTICO
   ========================================================================== */
function initCustomCursor() {
  const dot = document.getElementById('cursor-dot');
  const follower = document.getElementById('cursor-follower');
  if (!dot || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // El punto interno sigue la coordenada exacta sin retraso
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // Interpolación de movimiento suave (lerping) para el aro seguidor
  function renderCursor() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  // Micro-interacción: Escalar al pasar sobre elementos interactivos
  const interactiveElements = document.querySelectorAll('a, button, .project-card');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      follower.style.width = '48px';
      follower.style.height = '48px';
      follower.style.borderColor = 'rgba(0, 240, 255, 0.8)';
    });
    el.addEventListener('mouseleave', () => {
      follower.style.width = 'var(--cursor-size)';
      follower.style.height = 'var(--cursor-size)';
      follower.style.borderColor = 'rgba(0, 240, 255, 0.4)';
    });
  });
}

/* ==========================================================================
   3. ANIMACIONES DE ENTRADA Y CONTROL DE SCROLL CON GSAP
   ========================================================================== */
function initGSAPAnimations() {
  if (typeof gsap === 'undefined') return;

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Revelación cinemática inicial en el Hero
  gsap.to('.hero-elem', {
    opacity: 1,
    y: 0,
    duration: 1.2,
    stagger: 0.15,
    ease: 'power3.out',
    delay: 0.2
  });

  // Animación de aparición para las tarjetas de proyectos al hacer scroll
  gsap.utils.toArray('.project-card').forEach((card) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });
  });
}

/* ==========================================================================
   4. EFECTO DE TEXT SCRAMBLE (DECODIFICACIÓN TÉCNICA)
   ========================================================================== */
function initTextScramble() {
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  const scrambleElements = document.querySelectorAll('[data-scramble]');

  scrambleElements.forEach((el) => {
    const originalText = el.innerText;
    let iteration = 0;
    let interval = null;

    el.addEventListener('mouseenter', () => {
      clearInterval(interval);
      iteration = 0;

      interval = setInterval(() => {
        el.innerText = originalText
          .split('')
          .map((letter, index) => {
            if (index < iteration) return originalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');

        if (iteration >= originalText.length) {
          clearInterval(interval);
        }
        iteration += 1 / 2; // Controla la velocidad de decodificación
      }, 30);
    });
  });
}

/* ==========================================================================
   5. BORDES Y REFLEJO INTERACTIVO EN TARJETAS
   Calcula la posición local del cursor para el resplandor radial
   ========================================================================== */
function initCardGlow() {
  const cards = document.querySelectorAll('.project-card');

  cards.forEach((card) => {
    const glow = card.querySelector('.card-glow');
    if (!glow) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      glow.style.left = `${x}px`;
      glow.style.top = `${y}px`;
    });
  });
}