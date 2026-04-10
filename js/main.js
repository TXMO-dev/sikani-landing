/* ═══════════════════════════════════════════════════════════════════════════
   SIKANI TECHNOLOGIES — Landing Page Interactions
   GSAP + ScrollTrigger + Lenis + Three.js + Custom cursor
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Device detection ──────────────────────────────────────────────────────
const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Register GSAP Plugins ─────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ── Lenis Smooth Scroll (skip on mobile for native momentum scrolling) ────
const lenis = isMobile ? null : new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

if (lenis) {
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// ── Back to Top Button ────────────────────────────────────────────────────
const backToTop = document.getElementById('backToTop');
const bttProgress = document.querySelector('.btt-progress');
const bttCircumference = 2 * Math.PI * 22; // r=22

if (backToTop && bttProgress) {
  // Show/hide + fill progress ring based on scroll
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(scrollTop / docHeight, 1);

    // Show after scrolling 300px
    if (scrollTop > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // Update progress ring
    const offset = bttCircumference * (1 - scrollPercent);
    bttProgress.style.strokeDashoffset = offset;
  });

  // Click — smooth scroll to top, duration scales with distance
  backToTop.addEventListener('click', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = docHeight > 0 ? scrollTop / docHeight : 0;
    // 1.5s minimum, up to 4s from very bottom — smooth cinematic reverse
    const duration = 1.5 + scrollPct * 2.5;

    if (lenis) {
      lenis.scrollTo(0, { duration, easing: (t) => 1 - Math.pow(1 - t, 4) });
    } else {
      // For mobile without Lenis — use GSAP for smooth animated scroll
      gsap.to(window, {
        scrollTo: { y: 0, autoKill: false },
        duration: duration,
        ease: 'power3.inOut',
      });
    }

    // Arrow bounce animation on click
    gsap.to('.btt-arrow', {
      y: -8,
      duration: 0.2,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
    });
  });
}

// ── Loader ────────────────────────────────────────────────────────────────
const loader = document.getElementById('loader');
const loaderProgress = document.querySelector('.loader-progress');
let loadProgress = 0;

function simulateLoading() {
  const interval = setInterval(() => {
    loadProgress += Math.random() * 15 + 5;
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(interval);
      loaderProgress.style.width = '100%';
      setTimeout(() => {
        gsap.to(loader, {
          y: '-100%',
          duration: 0.8,
          ease: 'power3.inOut',
          onComplete: () => {
            loader.style.display = 'none';
            initAnimations();
          },
        });
      }, 400);
    } else {
      loaderProgress.style.width = loadProgress + '%';
    }
  }, 100);
}

window.addEventListener('load', simulateLoading);

// ── Custom Cursor ─────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');
let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

if (cursor && cursorTrail && window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.15 });
  });

  function animateTrail() {
    trailX += (mouseX - trailX) * 0.12;
    trailY += (mouseY - trailY) * 0.12;
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top = trailY + 'px';
    requestAnimationFrame(animateTrail);
  }
  animateTrail();

  // Hover states — use event delegation so it works on dynamic elements (modals, etc.)
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, [data-magnetic], input, textarea, select, .text-link, .legal-modal-close, .store-btn')) {
      cursor.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, [data-magnetic], input, textarea, select, .text-link, .legal-modal-close, .store-btn')) {
      cursor.classList.remove('hover');
    }
  });
}

// ── Magnetic Effect ───────────────────────────────────────────────────────
document.querySelectorAll('[data-magnetic]').forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.2, y: y * 0.2, duration: 0.4, ease: 'power2.out' });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  });
});

// ── Navigation ────────────────────────────────────────────────────────────
const nav = document.getElementById('nav');
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

ScrollTrigger.create({
  trigger: document.body,
  start: 'top -80',
  onEnter: () => nav.classList.add('scrolled'),
  onLeaveBack: () => nav.classList.remove('scrolled'),
});

menuBtn.addEventListener('click', () => {
  menuBtn.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach((link) => {
  link.addEventListener('click', () => {
    menuBtn.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const href = anchor.getAttribute('href');
    // Logo click → scroll to very top
    if (href === '#hero') {
      const scrollPct = (window.scrollY || 0) / (document.documentElement.scrollHeight - window.innerHeight || 1);
      const dur = 1.5 + scrollPct * 2.5;
      if (lenis) lenis.scrollTo(0, { duration: dur, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else gsap.to(window, { scrollTo: { y: 0, autoKill: false }, duration: dur, ease: 'power3.inOut' });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      if (lenis) lenis.scrollTo(target, { offset: -80 });
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Three.js Hero Background ──────────────────────────────────────────────
function initHeroScene() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));

  // Particle system — gold floating particles
  const particleCount = isMobile ? 200 : 800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;
    velocities[i] = (Math.random() - 0.5) * 0.005;
    velocities[i + 1] = (Math.random() - 0.5) * 0.005;
    velocities[i + 2] = (Math.random() - 0.5) * 0.005;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xD4AF37,
    size: 0.03,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Connection lines between nearby particles
  const lineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xD4AF37,
    transparent: true,
    opacity: 0.08,
  });

  camera.position.z = 5;

  let mouseXNorm = 0, mouseYNorm = 0;
  document.addEventListener('mousemove', (e) => {
    mouseXNorm = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseYNorm = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    requestAnimationFrame(animate);

    const posArr = geometry.attributes.position.array;
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArr[i] += velocities[i];
      posArr[i + 1] += velocities[i + 1];
      posArr[i + 2] += velocities[i + 2];

      // Wrap around
      if (Math.abs(posArr[i]) > 10) velocities[i] *= -1;
      if (Math.abs(posArr[i + 1]) > 10) velocities[i + 1] *= -1;
      if (Math.abs(posArr[i + 2]) > 10) velocities[i + 2] *= -1;
    }
    geometry.attributes.position.needsUpdate = true;

    particles.rotation.y += 0.0003;
    particles.rotation.x += 0.0001;

    // Mouse influence
    camera.position.x += (mouseXNorm * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (mouseYNorm * 0.3 - camera.position.y) * 0.02;

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ── GSAP Animations ───────────────────────────────────────────────────────
function initAnimations() {
  initHeroScene();

  // Hero text reveal — line-by-line with smooth entrance
  // (SplitType char animation breaks gradient-text, so use line-level animation)
  gsap.from('.hero-line', {
    y: 60,
    opacity: 0,
    stagger: 0.15,
    duration: 1,
    ease: 'power3.out',
    delay: 0.3,
  });

  // Reveal elements on scroll
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    const delay = parseFloat(el.dataset.delay || 0);
    gsap.fromTo(el,
      { y: 30, opacity: 0 },
      {
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
          once: true, // only animate once — never re-hide
        },
        y: 0,
        opacity: 1,
        duration: 0.7,
        delay,
        ease: 'power3.out',
      }
    );
  });

  // Section titles
  gsap.utils.toArray('[data-split]').forEach((el) => {
    gsap.fromTo(el,
      { y: 25, opacity: 0 },
      {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
      }
    );
  });

  // Counting animation for stats (hero + about)
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count);
    const counter = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          val: target,
          duration: 2.5,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.floor(counter.val).toLocaleString();
          },
        });
      },
    });
  });

  // Parallax on product cards
  gsap.utils.toArray('.product-card').forEach((card) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 90%',
        end: 'top 30%',
        scrub: 1,
      },
      y: 30,
      scale: 0.97,
    });
  });

  // Feature cards stagger with rotation
  gsap.set('.feature', { opacity: 0, y: 40 });
  ScrollTrigger.create({
    trigger: '.features-grid',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to('.feature', {
        y: 0, opacity: 1,
        stagger: 0.08,
        duration: 0.7,
        ease: 'power3.out',
      });
    },
  });
  // Steps animation
  gsap.utils.toArray('.step').forEach((step, i) => {
    gsap.fromTo(step,
      { x: -20, opacity: 0 },
      {
      scrollTrigger: {
        trigger: step,
        start: 'top 85%',
        once: true,
      },
      x: 0,
      opacity: 1,
      duration: 0.6,
      delay: i * 0.15,
      ease: 'power3.out',
    }
    );
  });

  // Security items
  gsap.set('.security-item', { opacity: 0, y: 25 });
  ScrollTrigger.create({
    trigger: '.security-grid',
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to('.security-item', { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out' });
    },
  });

  // Download section
  gsap.set('.store-btn', { opacity: 0, y: 15 });
  ScrollTrigger.create({
    trigger: '.download-buttons',
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.to('.store-btn', { y: 0, opacity: 1, stagger: 0.15, duration: 0.5, ease: 'power3.out' });
    },
  });
  // ── About section cards ──────────────────────────────────────────────
  gsap.set('.about-card', { opacity: 0, y: 40 });
  ScrollTrigger.create({
    trigger: '.about-cards',
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to('.about-card', {
        y: 0, opacity: 1,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
      });
    },
  });

  // ── Phone Mockup Scroll Animation ────────────────────────────────────
  const phoneShowcase = document.querySelector('.phone-showcase');
  const phoneLeft = document.querySelector('.phone-left');
  const phoneRight = document.querySelector('.phone-right');
  const phoneFeaturesText = document.querySelector('.phone-features-text');

  if (phoneShowcase && phoneLeft && phoneRight && window.innerWidth > 900) {
    // Set initial states
    gsap.set(phoneFeaturesText, { opacity: 0, y: 30 });

    const phoneTl = gsap.timeline({
      scrollTrigger: {
        trigger: phoneShowcase,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      },
    });

    phoneTl
      // Phase 1: Flatten both phones (rotate to 0)
      .to(phoneLeft, {
        rotateY: 0,
        rotateX: 0,
        duration: 1,
        ease: 'power2.inOut',
      })
      .to(phoneRight, {
        rotateY: 0,
        rotateX: 0,
        duration: 1,
        ease: 'power2.inOut',
      }, '<')
      // Phase 2: Separate phones left/right
      .to(phoneLeft, {
        x: -120,
        duration: 1,
        ease: 'power2.inOut',
      })
      .to(phoneRight, {
        x: 120,
        duration: 1,
        ease: 'power2.inOut',
      }, '<')
      // Phase 3: Reveal center text
      .to(phoneFeaturesText, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power3.out',
      }, '-=0.5');
  }

  // ── Horizontal Scroll Showcase ───────────────────────────────────────
  const horizontalSection = document.querySelector('.horizontal-section');
  const horizontalTrack = document.querySelector('.horizontal-track');

  if (horizontalSection && horizontalTrack) {
    const cards = gsap.utils.toArray('.horizontal-card');

    // Calculate how far to scroll
    const getScrollAmount = () => {
      return -(horizontalTrack.scrollWidth - window.innerWidth + 80);
    };

    gsap.to(horizontalTrack, {
      x: getScrollAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: horizontalSection,
        start: 'top top',
        end: () => '+=' + (horizontalTrack.scrollWidth - window.innerWidth + 80),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // Stagger card entrance
    cards.forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: horizontalSection,
          start: 'top 80%',
        },
        opacity: 0,
        y: 40,
        delay: i * 0.1,
        duration: 0.6,
        ease: 'power3.out',
      });
    });
  }

  // ── Word-by-Word Text Reveal ─────────────────────────────────────────
  const revealSection = document.querySelector('.text-reveal-section');
  const words = document.querySelectorAll('.reveal-word');

  if (revealSection && words.length > 0) {
    const revealTl = gsap.timeline({
      scrollTrigger: {
        trigger: revealSection,
        start: 'top top',
        end: isMobile ? '+=300%' : '+=200%',
        pin: true,
        scrub: isMobile ? 1 : 0.5,
        anticipatePin: 1,
      },
    });

    gsap.set(words, { opacity: 0.08, y: 30, filter: 'blur(6px)', scale: 0.95 });

    words.forEach((word, i) => {
      revealTl.to(word, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
        duration: 1,
        ease: 'power2.out',
      }, i * (isMobile ? 1 : 0.6));
    });

    revealTl.to({}, { duration: isMobile ? 4 : 2 });
  }

  // ── Scroll Progress Indicator ────────────────────────────────────────
  const scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    gsap.to(scrollProgress, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });
  }

  // ── Gradient Mesh Background Shift on Scroll ─────────────────────────
  const gradientBg = document.querySelector('.gradient-bg');
  if (gradientBg) {
    gsap.to(gradientBg, {
      background:
        'radial-gradient(ellipse at 80% 30%, rgba(212,175,55,0.06) 0%, transparent 50%), ' +
        'radial-gradient(ellipse at 20% 70%, rgba(212,175,55,0.04) 0%, transparent 50%), ' +
        'radial-gradient(ellipse at 60% 50%, rgba(184,150,15,0.05) 0%, transparent 50%)',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2,
      },
    });
  }

  // ── Hero Parallax Floating Shapes ────────────────────────────────────
  const heroShapes = document.querySelectorAll('.hero-shape');
  if (heroShapes.length > 0) {
    // Floating entrance
    gsap.from('.hero-shape.shape-1', { x: -100, opacity: 0, duration: 2, delay: 0.5, ease: 'power2.out' });
    gsap.from('.hero-shape.shape-2', { x: 100, opacity: 0, duration: 2, delay: 0.7, ease: 'power2.out' });
    gsap.from('.hero-shape.shape-3', { y: 80, opacity: 0, duration: 2, delay: 0.9, ease: 'power2.out' });

    // Parallax on scroll
    gsap.to('.hero-shape.shape-1', {
      y: -150,
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
    });
    gsap.to('.hero-shape.shape-2', {
      y: -80,
      x: 40,
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
    });
    gsap.to('.hero-shape.shape-3', {
      y: -200,
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 1 },
    });

    // Mouse parallax on hero shapes
    const hero = document.getElementById('hero');
    if (hero && window.matchMedia('(hover: hover)').matches) {
      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const mx = (e.clientX - rect.left) / rect.width - 0.5;
        const my = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to('.hero-shape.shape-1', { x: mx * -40, y: my * -30, duration: 1, ease: 'power2.out' });
        gsap.to('.hero-shape.shape-2', { x: mx * 25, y: my * 20, duration: 1.2, ease: 'power2.out' });
        gsap.to('.hero-shape.shape-3', { x: mx * -15, y: my * 25, duration: 1.4, ease: 'power2.out' });
      });
    }
  }

  // ── Subtle section entrance (gentle scale only — no clip-path to avoid conflicts) ─
  gsap.utils.toArray('.section').forEach((section) => {
    const container = section.querySelector('.container');
    if (container) {
      gsap.fromTo(container,
        { scale: 0.97 },
        {
          scale: 1,
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 30%',
            scrub: 1,
          },
        }
      );
    }
  });

  // ── Floating Badges — Smooth scrub parallax (no competing animations) ─
  const badges = document.querySelectorAll('.floating-badge');
  if (badges.length > 0) {
    // Entrance — once, clean
    badges.forEach((badge, i) => {
      gsap.from(badge, {
        opacity: 0,
        scale: 0.7,
        duration: 0.8,
        delay: 0.2 + i * 0.15,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.phone-showcase',
          start: 'top 75%',
          once: true,
        },
      });
    });

    // Single scrub-driven parallax per badge — different speeds for depth
    if (!isMobile) {
      const speeds = [-30, -50, -20, -40];
      badges.forEach((badge, i) => {
        gsap.to(badge, {
          y: speeds[i] || -30,
          ease: 'none',
          scrollTrigger: {
            trigger: '.phone-showcase',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2, // higher = smoother, less reactive
          },
        });
      });
    }
  }

  // ── Footer Curtain Reveal ────────────────────────────────────────────
  const footer = document.querySelector('.footer');
  if (footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      onUpdate: (self) => {
        gsap.set(footer, { y: (1 - self.progress) * -100 });
      },
    });
  }

  // ── Reusable Stroke Draw Animation ───────────────────────────────────
  function animateStrokeDraw(selector, triggerEl, opts = {}) {
    const elements = document.querySelectorAll(
      `${selector} path, ${selector} line, ${selector} circle, ${selector} rect`
    );
    elements.forEach((el) => {
      const length = el.getTotalLength ? el.getTotalLength() : 100;
      gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(el, {
        strokeDashoffset: 0,
        duration: opts.duration || 1.5,
        ease: opts.ease || 'power2.inOut',
        delay: opts.delay || 0,
        scrollTrigger: {
          trigger: triggerEl || el,
          start: opts.start || 'top 75%',
          toggleActions: 'play none none none',
        },
      });
    });
  }

  // ── Hero Shield — Pendulum + Glow + Mouse Proximity Scale ─────────────
  const heroShield = document.getElementById('heroShield');
  if (heroShield) {
    const shieldSvg = heroShield.querySelector('.hero-shield-svg');

    // Draw the shield on page load
    animateStrokeDraw('.hero-shield-svg', '#hero', { duration: 2, start: 'top 90%' });

    // Pendulum rotation
    gsap.to(shieldSvg, {
      rotation: 4,
      duration: 2.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      transformOrigin: 'center top',
    });

    // Floating bob
    gsap.to(heroShield, {
      y: -8,
      duration: 3,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });

    // Mouse proximity scale
    if (window.matchMedia('(hover: hover)').matches) {
      const heroEl = document.getElementById('hero');
      if (heroEl) {
        heroEl.addEventListener('mousemove', (e) => {
          const rect = heroShield.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
          const scale = Math.max(1, 1.3 - dist / 400);
          gsap.to(shieldSvg, { scale, duration: 0.4, ease: 'power2.out' });
        });
        heroEl.addEventListener('mouseleave', () => {
          gsap.to(shieldSvg, { scale: 1, duration: 0.6, ease: 'power2.out' });
        });
      }
    }
  }

  // ── Feature Animated Icons — Scroll-triggered ──────────────────────────
  // QR code: stroke draw
  document.querySelectorAll('.feature-anim-icon[data-anim="qr"]').forEach((icon) => {
    const els = icon.querySelectorAll('rect');
    els.forEach((el) => {
      const len = el.getTotalLength ? el.getTotalLength() : 60;
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(el, {
        strokeDashoffset: 0,
        duration: 1.2,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: icon.closest('.feature'), start: 'top 75%' },
      });
    });
  });

  // Card/phone flip
  document.querySelectorAll('.feature-anim-icon[data-anim="card-phone"]').forEach((icon) => {
    const card = icon.querySelector('.card-side');
    const phone = icon.querySelector('.phone-side');
    ScrollTrigger.create({
      trigger: icon.closest('.feature'),
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.timeline({ repeat: -1, repeatDelay: 1 })
          .to(card, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, '+=2')
          .to(phone, { opacity: 1, duration: 0.4, ease: 'power2.inOut' }, '<')
          .to(phone, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, '+=2')
          .to(card, { opacity: 1, duration: 0.4, ease: 'power2.inOut' }, '<');
      },
    });
  });

  // Bell wobble
  document.querySelectorAll('.feature-anim-icon[data-anim="bell"]').forEach((icon) => {
    ScrollTrigger.create({
      trigger: icon.closest('.feature'),
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.fromTo(icon, { rotation: 0 }, {
          rotation: 14,
          duration: 0.1,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.to(icon, {
              keyframes: [
                { rotation: -12, duration: 0.1 },
                { rotation: 10, duration: 0.1 },
                { rotation: -8, duration: 0.1 },
                { rotation: 6, duration: 0.1 },
                { rotation: -4, duration: 0.1 },
                { rotation: 2, duration: 0.1 },
                { rotation: 0, duration: 0.15 },
              ],
              ease: 'power2.inOut',
            });
          },
        });
      },
    });
  });

  // Clock ticking
  document.querySelectorAll('.feature-anim-icon[data-anim="clock"]').forEach((icon) => {
    const minuteHand = icon.querySelector('.clock-hand-m');
    const hourHand = icon.querySelector('.clock-hand-h');
    if (minuteHand && hourHand) {
      ScrollTrigger.create({
        trigger: icon.closest('.feature'),
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(minuteHand, {
            rotation: 360,
            duration: 4,
            ease: 'none',
            repeat: -1,
            transformOrigin: '20px 20px',
          });
          gsap.to(hourHand, {
            rotation: 30,
            duration: 4,
            ease: 'none',
            repeat: -1,
            transformOrigin: '20px 20px',
          });
        },
      });
    }
  });

  // Shield checkmark draw
  document.querySelectorAll('.feature-anim-icon[data-anim="shield"]').forEach((icon) => {
    animateStrokeDraw('.feature-anim-icon[data-anim="shield"]', icon.closest('.feature'), {
      duration: 1.5,
    });
  });

  // Chart bars grow
  document.querySelectorAll('.feature-anim-icon[data-anim="chart"]').forEach((icon) => {
    const bars = [
      { el: icon.querySelector('.chart-bar-1'), h: 10 },
      { el: icon.querySelector('.chart-bar-2'), h: 16 },
      { el: icon.querySelector('.chart-bar-3'), h: 12 },
      { el: icon.querySelector('.chart-bar-4'), h: 20 },
    ];
    ScrollTrigger.create({
      trigger: icon.closest('.feature'),
      start: 'top 75%',
      once: true,
      onEnter: () => {
        bars.forEach(({ el, h }, i) => {
          if (!el) return;
          gsap.to(el, {
            attr: { height: h, y: 28 - h },
            duration: 0.8,
            ease: 'back.out(1.5)',
            delay: i * 0.15,
          });
        });
      },
    });
  });

  // ── Step Icons — Scroll-triggered ──────────────────────────────────────
  // Step 1: QR generating (stroke draw)
  document.querySelectorAll('.step-anim-icon[data-step="qr-gen"]').forEach((icon) => {
    const rects = icon.querySelectorAll('rect');
    rects.forEach((r, i) => {
      const len = r.getTotalLength ? r.getTotalLength() : 40;
      gsap.set(r, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(r, {
        strokeDashoffset: 0,
        duration: 0.6,
        delay: i * 0.08,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: icon.closest('.step'), start: 'top 75%' },
      });
    });
  });

  // Step 2: Scan line sweeping
  document.querySelectorAll('.step-anim-icon[data-step="scan"]').forEach((icon) => {
    const scanLine = icon.querySelector('.scan-line');
    if (scanLine) {
      ScrollTrigger.create({
        trigger: icon.closest('.step'),
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.to(scanLine, {
            attr: { y1: 24, y2: 24 },
            duration: 1,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          });
        },
      });
    }
    // Draw phone outline
    const els = icon.querySelectorAll('rect, line, circle');
    els.forEach((el) => {
      if (el === scanLine) return;
      const len = el.getTotalLength ? el.getTotalLength() : 80;
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(el, {
        strokeDashoffset: 0,
        duration: 1,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: icon.closest('.step'), start: 'top 75%' },
      });
    });
  });

  // Step 3: Checkmark completing
  document.querySelectorAll('.step-anim-icon[data-step="check"]').forEach((icon) => {
    const els = icon.querySelectorAll('circle, path');
    els.forEach((el, i) => {
      const len = el.getTotalLength ? el.getTotalLength() : 100;
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(el, {
        strokeDashoffset: 0,
        duration: 1,
        delay: i * 0.4,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: icon.closest('.step'), start: 'top 75%' },
      });
    });
  });

  // ── Security Padlock — Scroll-triggered Draw ───────────────────────────
  const securityLock = document.getElementById('securityLock');
  if (securityLock) {
    const shackle = securityLock.querySelector('.lock-shackle');
    const body = securityLock.querySelector('.lock-body-rect');
    const glowCircle = securityLock.querySelector('.lock-glow-circle');

    [shackle, body].forEach((el) => {
      if (!el) return;
      const len = el.getTotalLength ? el.getTotalLength() : 200;
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    });

    ScrollTrigger.create({
      trigger: '#security',
      start: 'top 70%',
      once: true,
      onEnter: () => {
        // Draw body first
        if (body) {
          const bLen = body.getTotalLength ? body.getTotalLength() : 200;
          gsap.to(body, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' });
        }
        // Then shackle closes
        if (shackle) {
          const sLen = shackle.getTotalLength ? shackle.getTotalLength() : 200;
          gsap.to(shackle, { strokeDashoffset: 0, duration: 1, delay: 0.6, ease: 'power2.inOut' });
        }
        // Glow pulses
        if (glowCircle) {
          gsap.to(glowCircle, { opacity: 0.3, duration: 1, delay: 1.2, ease: 'power2.out' });
        }
      },
    });
  }

  // ── Download Phone — Scroll-triggered Draw + Fill ──────────────────────
  const downloadPhone = document.getElementById('downloadPhone');
  if (downloadPhone) {
    const phoneBody = downloadPhone.querySelector('.dl-phone-body');
    const phoneScreen = downloadPhone.querySelector('.dl-phone-screen');
    const appIcon = downloadPhone.querySelector('.dl-app-icon');
    const sparkles = downloadPhone.querySelectorAll('.sparkle');
    const screenGradStops = downloadPhone.querySelectorAll('#screenGrad stop');

    // Set initial stroke-dash states
    [phoneBody].forEach((el) => {
      if (!el) return;
      const len = el.getTotalLength ? el.getTotalLength() : 600;
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    });

    ScrollTrigger.create({
      trigger: '#download',
      start: 'top 70%',
      once: true,
      onEnter: () => {
        // Phase 1: Draw phone outline
        if (phoneBody) {
          gsap.to(phoneBody, { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut' });
        }
        // Phase 2: Fill screen with gold gradient
        if (screenGradStops.length >= 2) {
          gsap.to(screenGradStops[0], { attr: { 'stop-opacity': 0.08 }, duration: 0.8, delay: 1.2 });
          gsap.to(screenGradStops[1], { attr: { 'stop-opacity': 0.15 }, duration: 0.8, delay: 1.2 });
        }
        // Phase 3: App icon appears
        if (appIcon) {
          gsap.to(appIcon, { opacity: 1, duration: 0.6, delay: 1.8, ease: 'back.out(1.7)' });
        }
        // Phase 4: Sparkles
        sparkles.forEach((s, i) => {
          gsap.to(s, {
            opacity: 0.8,
            duration: 0.4,
            delay: 2.2 + i * 0.15,
            ease: 'power2.out',
            onComplete: () => {
              gsap.to(s, {
                y: -8,
                scale: 1.3,
                duration: 1.5,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
                delay: i * 0.3,
              });
            },
          });
        });
      },
    });
  }

  // ── Navigation Active Section Indicator ────────────────────────────────
  const navDot = document.getElementById('navActiveDot');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  if (navDot && navLinks.length > 0) {
    const sections = ['about', 'product', 'features', 'how-it-works', 'security'];

    function updateNavDot(activeId) {
      let activeLink = null;
      navLinks.forEach((link) => {
        if (link.dataset.section === activeId) {
          link.classList.add('active');
          activeLink = link;
        } else {
          link.classList.remove('active');
        }
      });
      if (activeLink) {
        const linkRect = activeLink.getBoundingClientRect();
        const parentRect = activeLink.parentElement.getBoundingClientRect();
        const left = linkRect.left - parentRect.left + linkRect.width / 2 - 2.5;
        gsap.to(navDot, { left, duration: 0.4, ease: 'power2.out' });
        navDot.classList.add('visible');
      } else {
        navDot.classList.remove('visible');
      }
    }

    sections.forEach((id) => {
      const section = document.getElementById(id);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section,
        start: 'top 40%',
        end: 'bottom 40%',
        onEnter: () => updateNavDot(id),
        onEnterBack: () => updateNavDot(id),
        onLeave: () => {},
        onLeaveBack: () => {},
      });
    });

    // Clear dot when at very top
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'top top',
      end: 'bottom 40%',
      onEnter: () => navDot.classList.remove('visible'),
      onEnterBack: () => navDot.classList.remove('visible'),
    });
  }

  // ── Registration Form GSAP Animations ──────────────────────────────
  const regCard = document.querySelector('.reg-card');
  if (regCard) {
    gsap.from('.reg-card', {
      scrollTrigger: {
        trigger: '.register',
        start: 'top 70%',
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    });

    gsap.from('.reg-field', {
      scrollTrigger: {
        trigger: '.reg-card',
        start: 'top 75%',
      },
      y: 20,
      opacity: 0,
      stagger: 0.06,
      duration: 0.5,
      delay: 0.3,
      ease: 'power3.out',
    });

    gsap.from('.reg-submit', {
      scrollTrigger: {
        trigger: '.reg-card',
        start: 'top 60%',
      },
      y: 20,
      opacity: 0,
      duration: 0.5,
      delay: 0.8,
      ease: 'power3.out',
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SELLER REGISTRATION — API + Validation + Form Handler
// ═══════════════════════════════════════════════════════════════════════════

const GRAPHQL_URL = window.location.hostname === 'localhost'
  ? 'http://192.168.1.148:5102/graphql'
  : 'https://api.sikani.tech/graphql';

// ── GraphQL registration call ────────────────────────────────────────────
async function registerSeller(data) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation RegisterSeller($input: SellerRegistrationInput!) {
        registerSeller(input: $input) {
          success message
          data { id email firstName lastName }
        }
      }`,
      variables: {
        input: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,
          confirmPassword: data.confirmPassword,
          businessName: data.businessName || null,
        }
      }
    })
  });

  if (!response.ok) throw new Error('Server error');
  const json = await response.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data?.registerSeller?.success) throw new Error(json.data?.registerSeller?.message || 'Registration failed');
  return json.data.registerSeller;
}

// ── Fallback email ───────────────────────────────────────────────────────
function fallbackEmail(data) {
  const subject = encodeURIComponent('New Seller Registration (API Down)');
  const body = encodeURIComponent(
    `New seller registration request:\n\n` +
    `Name: ${data.firstName} ${data.lastName}\n` +
    `Email: ${data.email}\n` +
    `Phone: ${data.phoneNumber}\n` +
    `Business: ${data.businessName || 'N/A'}\n\n` +
    `Note: This was submitted because the API was unavailable. Please create the account manually.`
  );
  window.location.href = `mailto:info@sikani.tech?subject=${subject}&body=${body}`;
}

// ── Validation helpers ───────────────────────────────────────────────────
const validators = {
  firstName: (v) => v.trim() ? '' : 'First name is required',
  lastName: (v) => v.trim() ? '' : 'Last name is required',
  email: (v) => {
    if (!v.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
    return '';
  },
  phone: (v) => {
    if (!v.trim()) return 'Phone number is required';
    const cleaned = v.replace(/[\s\-()]/g, '');
    if (!/^0[2-5][0-9]{8}$/.test(cleaned)) return 'Enter a valid Ghana phone number (e.g. 024XXXXXXX)';
    return '';
  },
  password: (v) => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(v)) return 'Password must include at least 1 uppercase letter';
    if (!/[0-9]/.test(v)) return 'Password must include at least 1 number';
    return '';
  },
  confirmPassword: (v, pw) => {
    if (!v) return 'Please confirm your password';
    if (v !== pw) return 'Passwords do not match';
    return '';
  },
  terms: (checked) => checked ? '' : 'You must agree to the terms',
};

function showFieldError(fieldId, errorId, msg) {
  const input = document.getElementById(fieldId);
  const errEl = document.getElementById(errorId);
  if (errEl) errEl.textContent = msg;
  if (input) {
    input.classList.toggle('invalid', !!msg);
    input.classList.toggle('valid', !msg && input.value.trim().length > 0);
  }
}

// ── Debounced real-time validation ───────────────────────────────────────
let debounceTimers = {};
function debounceValidate(fieldId, errorId, validatorFn, delay = 400) {
  const input = document.getElementById(fieldId);
  if (!input) return;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimers[fieldId]);
    debounceTimers[fieldId] = setTimeout(() => {
      const pw = fieldId === 'regConfirmPassword' ? document.getElementById('regPassword').value : undefined;
      const msg = validatorFn(input.value, pw);
      showFieldError(fieldId, errorId, msg);
    }, delay);
  });
}

// ── Password show/hide toggle ────────────────────────────────────────────
document.querySelectorAll('.pw-toggle').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (!input) return;
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    const openEye = btn.querySelector('.eye-open');
    const closedEye = btn.querySelector('.eye-closed');
    if (openEye) openEye.style.display = isPassword ? 'none' : '';
    if (closedEye) closedEye.style.display = isPassword ? '' : 'none';
  });
});

// ── Wire up debounced validation ─────────────────────────────────────────
debounceValidate('regFirstName', 'errFirstName', validators.firstName);
debounceValidate('regLastName', 'errLastName', validators.lastName);
debounceValidate('regEmail', 'errEmail', validators.email);
debounceValidate('regPhone', 'errPhone', validators.phone);
debounceValidate('regPassword', 'errPassword', validators.password);
debounceValidate('regConfirmPassword', 'errConfirmPassword', validators.confirmPassword);

// ── Mascot animation ────────────────────────────────────────────────────
const mascotWrap = document.getElementById('mascot');
const pupilL = document.querySelector('.mascot-pupil-l');
const pupilR = document.querySelector('.mascot-pupil-r');
const handL = document.querySelector('.mascot-hand-l ellipse');
const handR = document.querySelector('.mascot-hand-r ellipse');
const eyeL = document.querySelector('.mascot-eye-l');
const eyeR = document.querySelector('.mascot-eye-r');

if (mascotWrap) {
  // Track eye movement based on which input is focused
  const emailInput = document.getElementById('regEmail');
  const phoneInput = document.getElementById('regPhone');
  const firstNameInput = document.getElementById('regFirstName');
  const lastNameInput = document.getElementById('regLastName');
  const businessInput = document.getElementById('regBusiness');
  const passwordInput = document.getElementById('regPassword');
  const confirmInput = document.getElementById('regConfirmPassword');

  const textInputs = [emailInput, phoneInput, firstNameInput, lastNameInput, businessInput].filter(Boolean);
  const passwordInputs = [passwordInput, confirmInput].filter(Boolean);

  // Eyes follow text input caret position
  function trackEyes(inputEl) {
    if (!inputEl || !pupilL || !pupilR) return;
    const val = inputEl.value || '';
    // Map text length to pupil position (-5 to 5 horizontal)
    const progress = Math.min(val.length / 30, 1);
    const offsetX = (progress - 0.5) * 10;
    gsap.to(pupilL, { attr: { cx: 80 + offsetX }, duration: 0.15 });
    gsap.to(pupilR, { attr: { cx: 120 + offsetX }, duration: 0.15 });
    // Eyes slightly down when typing
    gsap.to(pupilL, { attr: { cy: 78 }, duration: 0.15 });
    gsap.to(pupilR, { attr: { cy: 78 }, duration: 0.15 });
  }

  // Reset eyes to center
  function resetEyes() {
    gsap.to(pupilL, { attr: { cx: 80, cy: 76 }, duration: 0.3 });
    gsap.to(pupilR, { attr: { cx: 120, cy: 76 }, duration: 0.3 });
    // Open eyes
    gsap.to(eyeL, { attr: { ry: 16 }, duration: 0.3 });
    gsap.to(eyeR, { attr: { ry: 16 }, duration: 0.3 });
  }

  // Password mode: cover eyes with hands
  function enterPasswordMode() {
    mascotWrap.classList.add('password-mode');
    // Animate hands to cover eyes
    gsap.to(handL, { attr: { cx: 78, cy: 75 }, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' });
    gsap.to(handR, { attr: { cx: 122, cy: 75 }, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' });
    // Squint eyes
    gsap.to(eyeL, { attr: { ry: 3 }, duration: 0.3 });
    gsap.to(eyeR, { attr: { ry: 3 }, duration: 0.3 });
  }

  function exitPasswordMode() {
    mascotWrap.classList.remove('password-mode');
    // Move hands away
    gsap.to(handL, { attr: { cx: 42, cy: 68 }, opacity: 0, duration: 0.4, ease: 'power2.in' });
    gsap.to(handR, { attr: { cx: 158, cy: 68 }, opacity: 0, duration: 0.4, ease: 'power2.in' });
    resetEyes();
  }

  // Text inputs — eyes follow
  textInputs.forEach(input => {
    input.addEventListener('focus', () => {
      exitPasswordMode();
      trackEyes(input);
    });
    input.addEventListener('input', () => trackEyes(input));
    input.addEventListener('blur', resetEyes);
  });

  // Password inputs — cover eyes
  passwordInputs.forEach(input => {
    input.addEventListener('focus', enterPasswordMode);
    input.addEventListener('blur', () => {
      exitPasswordMode();
      resetEyes();
    });
  });

  // Password show/hide toggle — peek through fingers
  document.querySelectorAll('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const isPeeking = btn.closest('.reg-field').querySelector('input').type === 'text';
      if (isPeeking) {
        // Covering eyes again
        gsap.to(eyeL, { attr: { ry: 3 }, duration: 0.2 });
        gsap.to(eyeR, { attr: { ry: 3 }, duration: 0.2 });
      } else {
        // Peeking — open eyes slightly, hands spread apart a bit
        gsap.to(eyeL, { attr: { ry: 8 }, duration: 0.3 });
        gsap.to(eyeR, { attr: { ry: 8 }, duration: 0.3 });
        gsap.to(handL, { attr: { cx: 70 }, duration: 0.3 });
        gsap.to(handR, { attr: { cx: 130 }, duration: 0.3 });
      }
    });
  });
}

// ── Multi-step form wizard ───────────────────────────────────────────────
(function initRegWizard() {
  let currentStep = 1;
  const totalSteps = 4;
  const indicators = document.querySelectorAll('.reg-step-indicator');
  const lines = document.querySelectorAll('.reg-step-line-fill');
  const panels = document.querySelectorAll('.reg-step-panel');

  if (!indicators.length || !panels.length) return;

  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;

    // Animate out current panel
    const currentPanel = document.querySelector(`.reg-step-panel[data-panel="${currentStep}"]`);
    const nextPanel = document.querySelector(`.reg-step-panel[data-panel="${step}"]`);
    if (!currentPanel || !nextPanel) return;

    const dir = step > currentStep ? 1 : -1;

    // Slide out
    gsap.to(currentPanel, {
      x: -40 * dir,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        currentPanel.classList.remove('active');
        nextPanel.classList.add('active');

        // Slide in
        gsap.fromTo(nextPanel, {
          x: 40 * dir,
          opacity: 0,
        }, {
          x: 0,
          opacity: 1,
          duration: 0.35,
          ease: 'power3.out',
        });
      },
    });

    // Update indicators
    indicators.forEach((ind) => {
      const s = parseInt(ind.dataset.step);
      ind.classList.remove('active', 'done');
      if (s === step) ind.classList.add('active');
      else if (s < step) ind.classList.add('done');
    });

    // Update progress lines
    lines.forEach((line, i) => {
      const lineStep = i + 1; // line after step i+1
      if (lineStep < step) {
        gsap.to(line, { width: '100%', duration: 0.4, ease: 'power2.out' });
      } else {
        gsap.to(line, { width: '0%', duration: 0.3, ease: 'power2.in' });
      }
    });

    currentStep = step;

    // Build summary on step 4
    if (step === 4) buildSummary();
  }

  // Next buttons
  document.querySelectorAll('.reg-next').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = parseInt(btn.dataset.next);
      goToStep(next);
    });
  });

  // Prev buttons
  document.querySelectorAll('.reg-prev').forEach((btn) => {
    btn.addEventListener('click', () => {
      const prev = parseInt(btn.dataset.prev);
      goToStep(prev);
    });
  });

  // Settlement method toggle
  const settlementSelect = document.getElementById('regSettlementMethod');
  const bankFields = document.getElementById('bankFields');
  const momoFields = document.getElementById('momoFields');
  if (settlementSelect) {
    settlementSelect.addEventListener('change', () => {
      const val = settlementSelect.value;
      if (bankFields) bankFields.style.display = val === 'bank' ? 'block' : 'none';
      if (momoFields) momoFields.style.display = val === 'momo' ? 'block' : 'none';

      // Animate fields in
      const target = val === 'bank' ? bankFields : momoFields;
      if (target) {
        gsap.from(target.children, {
          y: 15,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.08,
        });
      }
    });
  }

  // Build summary
  function buildSummary() {
    const summary = document.getElementById('regSummary');
    if (!summary) return;

    const val = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };
    const selText = (id) => {
      const el = document.getElementById(id);
      return el && el.selectedIndex > 0 ? el.options[el.selectedIndex].text : '—';
    };

    const rows = [
      { label: 'Name', value: `${val('regFirstName')} ${val('regLastName')}` },
      { label: 'Email', value: val('regEmail') },
      { label: 'Phone', value: val('regPhone') },
      { label: 'Business', value: val('regBusiness') || '—' },
      { label: 'Type', value: selText('regBusinessType') },
      { label: 'Tax ID', value: val('regTIN') || '—' },
      { label: 'Country', value: selText('regCountry') },
      { label: 'Settlement', value: selText('regSettlementMethod') },
    ];

    summary.innerHTML = rows.map((r) =>
      `<div class="reg-summary-row"><span class="reg-summary-label">${r.label}</span><span class="reg-summary-value">${r.value}</span></div>`
    ).join('');

    // Animate rows in
    gsap.from(summary.children, {
      y: 10,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      stagger: 0.05,
    });
  }
})();

// ── Form submit handler ──────────────────────────────────────────────────
const sellerRegForm = document.getElementById('sellerRegForm');
if (sellerRegForm) {
  let lastFormData = null;

  sellerRegForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const val = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const data = {
      firstName: val('regFirstName'),
      lastName: val('regLastName'),
      email: val('regEmail'),
      phoneNumber: val('regPhone'),
      businessName: val('regBusiness'),
      businessRegNumber: val('regBusinessReg'),
      tin: val('regTIN'),
      businessType: val('regBusinessType'),
      businessAddress: val('regBusinessAddress'),
      settlementMethod: val('regSettlementMethod'),
      bankName: val('regBankName'),
      bankBranch: val('regBankBranch'),
      accountNumber: val('regAccountNumber'),
      momoProvider: val('regMomoProvider'),
      momoNumber: val('regMomoNumber'),
      password: val('regPassword'),
      confirmPassword: val('regConfirmPassword'),
      terms: document.getElementById('regTerms').checked,
    };

    // Run all validations
    const errors = {
      firstName: validators.firstName(data.firstName),
      lastName: validators.lastName(data.lastName),
      email: validators.email(data.email),
      phone: validators.phone(data.phoneNumber),
      password: validators.password(data.password),
      confirmPassword: validators.confirmPassword(data.confirmPassword, data.password),
      terms: validators.terms(data.terms),
    };

    showFieldError('regFirstName', 'errFirstName', errors.firstName);
    showFieldError('regLastName', 'errLastName', errors.lastName);
    showFieldError('regEmail', 'errEmail', errors.email);
    showFieldError('regPhone', 'errPhone', errors.phone);
    showFieldError('regPassword', 'errPassword', errors.password);
    showFieldError('regConfirmPassword', 'errConfirmPassword', errors.confirmPassword);
    const termsErr = document.getElementById('errTerms');
    if (termsErr) termsErr.textContent = errors.terms;

    const hasErrors = Object.values(errors).some((msg) => msg);
    if (hasErrors) {
      const regCard = document.querySelector('.reg-card');
      if (regCard) {
        regCard.classList.remove('shake');
        void regCard.offsetWidth; // force reflow
        regCard.classList.add('shake');
      }
      return;
    }

    lastFormData = data;

    // Show loading
    const submitBtn = document.getElementById('regSubmitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    submitBtn.disabled = true;
    btnText.textContent = 'Creating account...';
    btnSpinner.style.display = '';

    const fallbackEl = document.getElementById('regFallback');
    fallbackEl.style.display = 'none';

    try {
      await registerSeller(data);
      // Success — show modal
      const modal = document.getElementById('regSuccessModal');
      modal.style.display = 'flex';
      gsap.from('.reg-modal-content', { scale: 0.9, opacity: 0, duration: 0.4, ease: 'back.out(1.7)' });
      sellerRegForm.reset();
      // Reset field styles
      sellerRegForm.querySelectorAll('input, select').forEach((inp) => {
        inp.classList.remove('valid', 'invalid');
      });
      sellerRegForm.querySelectorAll('.field-error').forEach((el) => {
        el.textContent = '';
      });
      // Reset wizard to step 1
      document.querySelectorAll('.reg-step-panel').forEach((p) => p.classList.remove('active'));
      const step1 = document.querySelector('.reg-step-panel[data-panel="1"]');
      if (step1) { step1.classList.add('active'); gsap.set(step1, { x: 0, opacity: 1 }); }
      document.querySelectorAll('.reg-step-indicator').forEach((ind) => {
        ind.classList.remove('active', 'done');
        if (ind.dataset.step === '1') ind.classList.add('active');
      });
      document.querySelectorAll('.reg-step-line-fill').forEach((l) => { l.style.width = '0%'; });
      // Hide conditional fields
      const bankF = document.getElementById('bankFields');
      const momoF = document.getElementById('momoFields');
      if (bankF) bankF.style.display = 'none';
      if (momoF) momoF.style.display = 'none';
      // Clear summary
      const summary = document.getElementById('regSummary');
      if (summary) summary.innerHTML = '';
    } catch (err) {
      // Show error + fallback
      fallbackEl.style.display = '';
      const regCard = document.querySelector('.reg-card');
      if (regCard) {
        regCard.classList.remove('shake');
        void regCard.offsetWidth;
        regCard.classList.add('shake');
      }
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Create Seller Account';
      btnSpinner.style.display = 'none';
    }
  });

  // Fallback email button
  const fallbackBtn = document.getElementById('fallbackEmailBtn');
  if (fallbackBtn) {
    fallbackBtn.addEventListener('click', () => {
      if (lastFormData) fallbackEmail(lastFormData);
    });
  }

  // Close success modal
  const modalClose = document.getElementById('regModalClose');
  const modalOverlay = document.querySelector('.reg-modal-overlay');
  function closeModal() {
    const modal = document.getElementById('regSuccessModal');
    gsap.to('.reg-modal-content', {
      scale: 0.9, opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => { modal.style.display = 'none'; }
    });
  }
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
}

// ══════════════════════════════════════════════════════════════════════════
// HERO — Dynamic Pexels background photo with Ken Burns
// ══════════════════════════════════════════════════════════════════════════
(function initHeroPhoto() {
  const img = document.getElementById('heroPhotoImg');
  if (!img) return;

  // Pool of high-quality African fintech / payments / business hero images
  const HERO_POOL = [
    'https://images.pexels.com/photos/6694482/pexels-photo-6694482.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    'https://images.pexels.com/photos/7567236/pexels-photo-7567236.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    'https://images.pexels.com/photos/7567535/pexels-photo-7567535.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    'https://images.pexels.com/photos/7567606/pexels-photo-7567606.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    'https://images.pexels.com/photos/5647280/pexels-photo-5647280.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    'https://images.pexels.com/photos/4559704/pexels-photo-4559704.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
    'https://images.pexels.com/photos/7679884/pexels-photo-7679884.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=2',
  ];

  const src = HERO_POOL[Math.floor(Math.random() * HERO_POOL.length)];
  img.src = src;
  img.onload = () => img.classList.add('loaded');
  // Fallback — if image fails, hero stays with canvas-only bg
  img.onerror = () => { img.style.display = 'none'; };
})();

// ══════════════════════════════════════════════════════════════════════════
// SHOWCASE — Awwwards-tier animations
// ══════════════════════════════════════════════════════════════════════════
(function initShowcase() {
  const section = document.getElementById('showcase');
  const grid = document.getElementById('showcaseGrid');
  const items = gsap.utils.toArray('.showcase-item');
  if (!section || !items.length) return;

  // ── 1. Gold particle canvas (desktop only) ──────────────────────────────
  if (!isMobile && !prefersReducedMotion) {
    const canvas = document.getElementById('showcaseParticles');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let cW, cH, particles = [];
      const PARTICLE_COUNT = 60;

      function resizeCanvas() {
        const rect = section.getBoundingClientRect();
        cW = canvas.width = rect.width;
        cH = canvas.height = rect.height;
      }
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Seed particles
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * cW,
          y: Math.random() * cH,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.15 - Math.random() * 0.35,
          r: 0.8 + Math.random() * 1.8,
          alpha: 0.15 + Math.random() * 0.35,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.6,
        });
      }

      let particleRAF;
      let isVisible = false;

      function drawParticles(time) {
        if (!isVisible) return;
        ctx.clearRect(0, 0, cW, cH);
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          const breathe = 0.6 + 0.4 * Math.sin(time * 0.001 * p.speed + p.phase);

          // Wrap around
          if (p.y < -10) { p.y = cH + 10; p.x = Math.random() * cW; }
          if (p.x < -10) p.x = cW + 10;
          if (p.x > cW + 10) p.x = -10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(212,175,55,${p.alpha * breathe})`;
          ctx.fill();
        }
        particleRAF = requestAnimationFrame(drawParticles);
      }

      // Only animate when section is in view
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => { isVisible = true; particleRAF = requestAnimationFrame(drawParticles); },
        onLeave: () => { isVisible = false; cancelAnimationFrame(particleRAF); },
        onEnterBack: () => { isVisible = true; particleRAF = requestAnimationFrame(drawParticles); },
        onLeaveBack: () => { isVisible = false; cancelAnimationFrame(particleRAF); },
      });
    }
  }

  // ── 2. Ambient orb float (desktop only) ─────────────────────────────────
  if (!isMobile && !prefersReducedMotion) {
    const orbs = gsap.utils.toArray('.showcase-orb');
    orbs.forEach((orb, i) => {
      gsap.set(orb, { opacity: 0 });
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(orb, { opacity: 1, duration: 2, delay: i * 0.4, ease: 'power2.out' });
          gsap.to(orb, {
            y: `random(-40, 40)`,
            x: `random(-30, 30)`,
            duration: 6 + i * 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        },
      });
    });
  }

  // ── 3. Clip-path staggered reveal with scale choreography ───────────────
  const revealTL = gsap.timeline({
    scrollTrigger: {
      trigger: grid,
      start: 'top 82%',
      once: true,
    },
    onComplete: () => {
      // After reveal completes, mark all items for continuous CSS drift
      items.forEach((item) => item.classList.add('revealed'));
      // Start the repeating shimmer loop
      startShimmerLoop();
    },
  });

  items.forEach((item, i) => {
    const img = item.querySelector('img');
    const fromDir = i % 2 === 0 ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)';
    gsap.set(item, { clipPath: fromDir, opacity: 1 });
    if (img) gsap.set(img, { scale: 1.3 });

    revealTL.to(item, {
      clipPath: 'inset(0% 0 0% 0)',
      duration: 1.2,
      ease: 'power4.inOut',
    }, i * 0.12);

    if (img) {
      revealTL.to(img, {
        scale: 1.15,
        duration: 1.6,
        ease: 'power2.out',
      }, i * 0.12);
    }
  });

  // ── 4. Continuous shimmer sweep — subtle gold light passes over items ───
  function startShimmerLoop() {
    if (prefersReducedMotion) return;
    let shimmerIdx = 0;
    function triggerShimmer() {
      const item = items[shimmerIdx % items.length];
      item.classList.remove('shimmer-active');
      void item.offsetWidth; // reflow to restart animation
      item.classList.add('shimmer-active');
      // Remove class after animation completes
      setTimeout(() => item.classList.remove('shimmer-active'), 2200);
      shimmerIdx++;
      // Schedule next shimmer — staggered 3-5s apart
      setTimeout(triggerShimmer, 3000 + Math.random() * 2000);
    }
    // Start first shimmer after a short delay
    setTimeout(triggerShimmer, 2000);
  }

  // ── 5. Scroll-driven parallax per item (desktop) ────────────────────────
  if (!isMobile && !prefersReducedMotion) {
    items.forEach((item, i) => {
      const img = item.querySelector('img');
      if (!img) return;
      const direction = i % 3 === 0 ? -15 : i % 3 === 1 ? -8 : -12;
      gsap.to(img, {
        yPercent: direction,
        ease: 'none',
        scrollTrigger: {
          trigger: item,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      });
    });
  }

  // ── 6. 3D tilt on hover (desktop) ──────────────────────────────────────
  if (!isMobile && !prefersReducedMotion) {
    items.forEach((item) => {
      let bounds;
      const handleEnter = () => {
        bounds = item.getBoundingClientRect();
        item.classList.add('is-active');
      };
      const handleLeave = () => {
        item.classList.remove('is-active');
        gsap.to(item, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power2.out' });
      };
      const handleMove = (e) => {
        if (!bounds) return;
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        const rotateY = ((x / bounds.width) - 0.5) * 12;
        const rotateX = ((y / bounds.height) - 0.5) * -10;
        gsap.to(item, { rotateX, rotateY, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      };
      item.addEventListener('mouseenter', handleEnter);
      item.addEventListener('mouseleave', handleLeave);
      item.addEventListener('mousemove', handleMove);
    });
  }

  // ── 7. Text scramble on hover ──────────────────────────────────────────
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';
  function scrambleText(el) {
    const original = el.dataset.original || (el.dataset.original = el.textContent);
    const len = original.length;
    let iteration = 0;
    const maxIterations = len;
    clearInterval(el._scrambleInterval);
    el._scrambleInterval = setInterval(() => {
      el.textContent = original
        .split('')
        .map((char, i) => {
          if (i < iteration) return original[i];
          if (char === ' ') return ' ';
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join('');
      iteration += 1 / 2;
      if (iteration >= maxIterations) {
        el.textContent = original;
        clearInterval(el._scrambleInterval);
      }
    }, 30);
  }

  if (!isMobile) {
    items.forEach((item) => {
      const caption = item.querySelector('[data-scramble]');
      if (caption) {
        item.addEventListener('mouseenter', () => scrambleText(caption));
      }
    });
  }

  // ── 8. CTA reveal ──────────────────────────────────────────────────────
  const cta = document.querySelector('.showcase-cta');
  if (cta) {
    gsap.set(cta, { opacity: 0, y: 40 });
    ScrollTrigger.create({
      trigger: cta,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.to(cta, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          delay: 0.3,
        });
      },
    });
  }

  // ── 9. Whole-grid subtle sway on scroll (desktop) ──────────────────────
  if (!isMobile && !prefersReducedMotion) {
    gsap.to(grid, {
      rotateX: 2,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2,
      },
    });
  }

  // ── 10. Floating gold dots around the grid (desktop) ───────────────────
  if (!isMobile && !prefersReducedMotion) {
    const DOT_COUNT = 8;
    for (let i = 0; i < DOT_COUNT; i++) {
      const dot = document.createElement('div');
      dot.className = 'showcase-float-dot';
      const size = 3 + Math.random() * 4;
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      dot.style.background = `rgba(212,175,55,${0.15 + Math.random() * 0.2})`;
      dot.style.left = (5 + Math.random() * 90) + '%';
      dot.style.top = (5 + Math.random() * 90) + '%';
      grid.appendChild(dot);

      // Continuous floating animation
      gsap.set(dot, { opacity: 0 });
      gsap.to(dot, {
        opacity: 1,
        duration: 1.5,
        delay: 1 + i * 0.3,
        scrollTrigger: { trigger: grid, start: 'top 80%', once: true },
      });

      gsap.to(dot, {
        y: `random(-50, 50)`,
        x: `random(-40, 40)`,
        duration: 5 + Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 3,
      });

      // Subtle pulse
      gsap.to(dot, {
        scale: 0.4 + Math.random() * 0.4,
        opacity: 0.1,
        duration: 2 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: Math.random() * 2,
      });
    }
  }
})();

// ══════════════════════════════════════════════════════════════════════════
// LEGAL MODAL — Inline Terms / Privacy viewer with animations
// ══════════════════════════════════════════════════════════════════════════
(function initLegalModal() {
  const modal = document.getElementById('legalModal');
  const overlay = modal?.querySelector('.legal-modal-overlay');
  const container = modal?.querySelector('.legal-modal-container');
  const closeBtn = document.getElementById('legalModalClose');
  const acceptBtn = document.getElementById('legalModalAccept');
  const titleEl = document.getElementById('legalModalTitle');
  const bodyEl = document.getElementById('legalModalBody');
  const contentEl = document.getElementById('legalModalContent');
  const progressBar = document.getElementById('legalModalProgress');
  if (!modal || !contentEl) return;

  // Cache fetched HTML
  const cache = {};

  // Expose globally for inline onclick
  window.openLegalModal = async function (type) {
    const isTerms = type === 'terms';
    titleEl.textContent = isTerms ? 'Terms of Service' : 'Privacy Policy';
    const url = isTerms ? 'terms.html' : 'privacy.html';

    // Show modal immediately with loading state
    modal.style.display = 'flex';
    contentEl.innerHTML = '<p style="color:rgba(255,255,255,0.3);text-align:center;padding:40px 0;">Loading...</p>';
    progressBar.style.width = '0%';
    bodyEl.scrollTop = 0;

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // Animate in
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
    gsap.fromTo(container, {
      opacity: 0,
      scale: 0.92,
      y: 40,
      rotateX: 6,
    }, {
      opacity: 1,
      scale: 1,
      y: 0,
      rotateX: 0,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.1,
    });

    // Fetch content (cached)
    if (!cache[type]) {
      try {
        const res = await fetch(url);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const legalPage = doc.querySelector('.legal-page');
        if (legalPage) {
          // Remove h1 and .legal-updated (we have our own header)
          const h1 = legalPage.querySelector('h1');
          const updated = legalPage.querySelector('.legal-updated');
          const toc = legalPage.querySelector('.legal-toc');
          if (h1) h1.remove();
          if (updated) h1; // already removed
          if (toc) toc.remove();
          cache[type] = legalPage.innerHTML;
        }
      } catch {
        cache[type] = '<p style="color:rgba(255,255,255,0.5);text-align:center;padding:40px 0;">Failed to load. Please try again.</p>';
      }
    }

    contentEl.innerHTML = cache[type];

    // Animate sections in with stagger
    const sections = contentEl.querySelectorAll('section, h2, h3');
    sections.forEach((el, i) => {
      setTimeout(() => el.classList.add('lm-visible'), 80 + i * 40);
    });

    // Also reveal non-section direct children
    const directChildren = contentEl.children;
    for (let i = 0; i < directChildren.length; i++) {
      const el = directChildren[i];
      if (!el.classList.contains('lm-visible')) {
        setTimeout(() => el.classList.add('lm-visible'), 80 + i * 30);
      }
    }
  };

  // Reading progress
  if (bodyEl) {
    bodyEl.addEventListener('scroll', () => {
      const scrollTop = bodyEl.scrollTop;
      const scrollHeight = bodyEl.scrollHeight - bodyEl.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    });
  }

  // Close
  function closeLegalModal() {
    gsap.to(container, {
      opacity: 0,
      scale: 0.92,
      y: 30,
      duration: 0.35,
      ease: 'power2.in',
    });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      },
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLegalModal);
  if (acceptBtn) acceptBtn.addEventListener('click', closeLegalModal);
  if (overlay) overlay.addEventListener('click', closeLegalModal);

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display !== 'none') {
      closeLegalModal();
    }
  });
})();

// ══════════════════════════════════════════════════════════════════════════
// p5.js — Generative network graph (About section)
// ══════════════════════════════════════════════════════════════════════════
if (!isMobile && !prefersReducedMotion && typeof p5 !== 'undefined') {
  new p5((sketch) => {
    const parent = document.getElementById('aboutNetworkCanvas');
    if (!parent) return;

    const nodes = [];
    const NODE_COUNT = 40;
    const CONNECTION_DIST = 180;
    let isVisible = false;

    sketch.setup = function () {
      const canvas = sketch.createCanvas(parent.offsetWidth, parent.offsetHeight);
      canvas.parent(parent);
      sketch.noFill();

      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: sketch.random(sketch.width),
          y: sketch.random(sketch.height),
          vx: sketch.random(-0.3, 0.3),
          vy: sketch.random(-0.3, 0.3),
          r: sketch.random(2, 5),
        });
      }
    };

    sketch.draw = function () {
      if (!isVisible) return;
      sketch.clear();

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > sketch.width) n.vx *= -1;
        if (n.y < 0 || n.y > sketch.height) n.vy *= -1;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = sketch.dist(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
          if (d < CONNECTION_DIST) {
            const alpha = sketch.map(d, 0, CONNECTION_DIST, 80, 0);
            sketch.stroke(212, 175, 55, alpha);
            sketch.strokeWeight(1);
            sketch.line(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        sketch.fill(212, 175, 55, 100);
        sketch.noStroke();
        sketch.ellipse(n.x, n.y, n.r * 2);
        // Glow ring
        sketch.noFill();
        sketch.stroke(212, 175, 55, 25);
        sketch.strokeWeight(0.5);
        sketch.ellipse(n.x, n.y, n.r * 5);
      }
    };

    sketch.windowResized = function () {
      if (parent) sketch.resizeCanvas(parent.offsetWidth, parent.offsetHeight);
    };

    // Only run when visible
    ScrollTrigger.create({
      trigger: '#about',
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => { isVisible = true; },
      onLeave: () => { isVisible = false; },
      onEnterBack: () => { isVisible = true; },
      onLeaveBack: () => { isVisible = false; },
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// Matter.js — Physics-based floating security icons (Security section)
// ══════════════════════════════════════════════════════════════════════════
if (!isMobile && !prefersReducedMotion && typeof Matter !== 'undefined') {
  (function initSecurityPhysics() {
    const canvas = document.getElementById('securityPhysicsCanvas');
    const section = document.getElementById('security');
    if (!canvas || !section) return;

    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter;

    const w = section.offsetWidth;
    const h = section.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const engine = Engine.create({ gravity: { x: 0, y: 0.08 } });
    const ctx = canvas.getContext('2d');

    // Walls
    const walls = [
      Bodies.rectangle(w / 2, h + 25, w, 50, { isStatic: true }),
      Bodies.rectangle(-25, h / 2, 50, h, { isStatic: true }),
      Bodies.rectangle(w + 25, h / 2, 50, h, { isStatic: true }),
      Bodies.rectangle(w / 2, -25, w, 50, { isStatic: true }),
    ];
    Composite.add(engine.world, walls);

    // Floating circles (representing shield/lock/key icons)
    const symbols = [];
    const SYMBOL_COUNT = 18;
    for (let i = 0; i < SYMBOL_COUNT; i++) {
      const r = 12 + Math.random() * 24;
      const body = Bodies.circle(
        Math.random() * w,
        Math.random() * h * 0.5,
        r,
        {
          restitution: 0.6,
          friction: 0.1,
          frictionAir: 0.02,
          render: { visible: false },
        }
      );
      body._radius = r;
      body._alpha = 0.35 + Math.random() * 0.4;
      symbols.push(body);
    }
    Composite.add(engine.world, symbols);

    let isActive = false;
    let runner;

    function drawBodies() {
      if (!isActive) return;
      ctx.clearRect(0, 0, w, h);

      for (const body of symbols) {
        const { x, y } = body.position;
        ctx.beginPath();
        ctx.arc(x, y, body._radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${body._alpha * 0.5})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(212, 175, 55, ${body._alpha * 0.7})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      requestAnimationFrame(drawBodies);
    }

    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => {
        isActive = true;
        runner = Runner.create();
        Runner.run(runner, engine);
        drawBodies();
      },
      onLeave: () => { isActive = false; if (runner) Runner.stop(runner); },
      onEnterBack: () => {
        isActive = true;
        runner = Runner.create();
        Runner.run(runner, engine);
        drawBodies();
      },
      onLeaveBack: () => { isActive = false; if (runner) Runner.stop(runner); },
    });
  })();
}

// ══════════════════════════════════════════════════════════════════════════
// Rough.js — Hand-drawn decorative shapes (How It Works section)
// ══════════════════════════════════════════════════════════════════════════
if (!isMobile && !prefersReducedMotion && typeof rough !== 'undefined') {
  (function initRoughCanvas() {
    const canvas = document.getElementById('roughCanvas');
    const section = document.getElementById('how-it-works');
    if (!canvas || !section) return;

    canvas.width = section.offsetWidth;
    canvas.height = section.offsetHeight;
    const rc = rough.canvas(canvas);

    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        const w = canvas.width;
        const h = canvas.height;
        const opts = { stroke: 'rgba(212,175,55,0.3)', strokeWidth: 1, roughness: 1.5, bowing: 2 };

        // Scattered hand-drawn circles
        for (let i = 0; i < 8; i++) {
          const x = Math.random() * w;
          const y = Math.random() * h;
          const r = 20 + Math.random() * 60;
          rc.circle(x, y, r, { ...opts, stroke: `rgba(212,175,55,${0.08 + Math.random() * 0.12})` });
        }

        // Wavy lines connecting the steps area
        const midY = h * 0.55;
        rc.line(w * 0.1, midY, w * 0.9, midY, { ...opts, stroke: 'rgba(212,175,55,0.08)', roughness: 3 });
        rc.line(w * 0.15, midY + 30, w * 0.85, midY + 30, { ...opts, stroke: 'rgba(212,175,55,0.05)', roughness: 4 });

        // Corner brackets
        rc.rectangle(20, 20, 60, 60, { ...opts, stroke: 'rgba(212,175,55,0.1)' });
        rc.rectangle(w - 80, h - 80, 60, 60, { ...opts, stroke: 'rgba(212,175,55,0.1)' });
      },
    });
  })();
}

// ══════════════════════════════════════════════════════════════════════════
// GPU.js — Accelerated metaball field (Features section)
// ══════════════════════════════════════════════════════════════════════════
if (!isMobile && !prefersReducedMotion && typeof GPU !== 'undefined') {
  (function initGpuMetaballs() {
    const canvas = document.getElementById('gpuMetaballCanvas');
    const section = document.getElementById('features');
    if (!canvas || !section) return;

    // Use a low-res render for performance, scale up with CSS
    const SCALE = 4; // render at 1/4 resolution
    const w = Math.floor(section.offsetWidth / SCALE);
    const h = Math.floor(section.offsetHeight / SCALE);
    canvas.width = w;
    canvas.height = h;

    try {
      const gpu = new GPU({ canvas, mode: 'gpu' });

      const metaballKernel = gpu.createKernel(function (bx, by, time) {
        const x = this.thread.x;
        const y = this.constants.h - this.thread.y; // flip Y
        let sum = 0;

        // 5 metaballs
        for (let i = 0; i < 5; i++) {
          const cx = bx[i];
          const cy = by[i];
          const dx = x - cx;
          const dy = y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) + 1;
          sum += 400 / dist;
        }

        // Gold color with threshold
        const v = Math.min(sum / 8, 1);
        if (v < 0.3) {
          this.color(0, 0, 0, 0);
        } else {
          const fade = (v - 0.3) / 0.7;
          this.color(0.83 * fade, 0.69 * fade, 0.22 * fade, fade * 0.6);
        }
      })
        .setOutput([w, h])
        .setGraphical(true)
        .setConstants({ h });

      // Metaball positions
      const balls = Array.from({ length: 5 }, (_, i) => ({
        x: w * (0.2 + Math.random() * 0.6),
        y: h * (0.2 + Math.random() * 0.6),
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.6,
        phase: Math.random() * Math.PI * 2,
      }));

      let isActive = false;
      let raf;

      function animate(time) {
        if (!isActive) return;

        const bx = [];
        const by = [];
        for (const b of balls) {
          b.x += b.vx + Math.sin(time * 0.001 + b.phase) * 0.3;
          b.y += b.vy + Math.cos(time * 0.0008 + b.phase) * 0.2;
          if (b.x < 0 || b.x > w) b.vx *= -1;
          if (b.y < 0 || b.y > h) b.vy *= -1;
          b.x = Math.max(0, Math.min(w, b.x));
          b.y = Math.max(0, Math.min(h, b.y));
          bx.push(b.x);
          by.push(b.y);
        }

        metaballKernel(bx, by, time * 0.001);
        raf = requestAnimationFrame(animate);
      }

      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => { isActive = true; raf = requestAnimationFrame(animate); },
        onLeave: () => { isActive = false; cancelAnimationFrame(raf); },
        onEnterBack: () => { isActive = true; raf = requestAnimationFrame(animate); },
        onLeaveBack: () => { isActive = false; cancelAnimationFrame(raf); },
      });
    } catch (e) {
      // GPU.js may fail on some hardware — graceful degradation
      canvas.style.display = 'none';
    }
  })();
}

// ══════════════════════════════════════════════════════════════════════════
// Pts.js — Flowing perlin noise field (Text Reveal section)
// ══════════════════════════════════════════════════════════════════════════
if (!prefersReducedMotion && typeof Pts !== 'undefined') {
  (function initPtsField() {
    const container = document.getElementById('ptsCanvas');
    if (!container) return;

    const { CanvasSpace, Create, Num, Geom } = Pts;

    const space = new CanvasSpace(container).setup({
      bgcolor: 'transparent',
      resize: true,
      retina: true,
    });

    const form = space.getForm();
    let noiseSeed = 0;
    let isVisible = false;

    space.add({
      animate: (time) => {
        if (!isVisible) return;
        noiseSeed += 0.002;
        const pts = Create.gridPts(space.innerBound, 20, 12);

        pts.forEach((p) => {
          const noise = Num.normalizeValue(
            Math.sin(p.x * 0.003 + noiseSeed) * Math.cos(p.y * 0.004 + noiseSeed * 0.7),
            -1, 1
          );
          const angle = noise * Math.PI * 2;
          const len = 12 + noise * 10;
          const end = Geom.toRadian(angle);

          const x2 = p.x + Math.cos(end) * len;
          const y2 = p.y + Math.sin(end) * len;

          const alpha = 0.05 + noise * 0.08;
          form.strokeOnly(`rgba(212,175,55,${alpha})`, 0.8).line([p, [x2, y2]]);
        });
      },
    });

    space.play();

    // Visibility control
    ScrollTrigger.create({
      trigger: '.text-reveal-section',
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => { isVisible = true; },
      onLeave: () => { isVisible = false; },
      onEnterBack: () => { isVisible = true; },
      onLeaveBack: () => { isVisible = false; },
    });
  })();
}

// ══════════════════════════════════════════════════════════════════════════
// Particle Burst — on CTA button clicks (download, register, showcase)
// ══════════════════════════════════════════════════════════════════════════
(function initParticleBurst() {
  if (prefersReducedMotion) return;

  function burst(x, y) {
    const count = 20;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position:fixed;left:${x}px;top:${y}px;width:4px;height:4px;
        border-radius:50%;background:#D4AF37;pointer-events:none;z-index:99999;
      `;
      document.body.appendChild(particle);

      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const dist = 40 + Math.random() * 80;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      gsap.to(particle, {
        x: dx,
        y: dy,
        opacity: 0,
        scale: Math.random() * 2,
        duration: 0.6 + Math.random() * 0.4,
        ease: 'power3.out',
        onComplete: () => particle.remove(),
      });
    }
  }

  // Attach to all primary CTA buttons
  document.querySelectorAll('.btn-primary, .nav-cta, .store-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      burst(e.clientX, e.clientY);
    });
  });
})();

// ══════════════════════════════════════════════════════════════════════════
// Velocity.js — Smooth element reveals (especially on mobile)
// ══════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════
// About Section — Infinite icon animations (GSAP)
// ══════════════════════════════════════════════════════════════════════════
(function initAboutIconAnims() {
  // ── Mission icon: pulsing ring + rotating beam ──────────────────────────
  const missionRing = document.querySelector('.mission-ring');
  const missionBeam = document.querySelector('.mission-beam');
  const missionDot = document.querySelector('.mission-dot');

  if (missionRing) {
    // Ring breathes
    gsap.to(missionRing, {
      attr: { r: 11 },
      opacity: 0.5,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    // Whole icon slowly rotates
    gsap.to('#aboutIconMission svg', {
      rotation: 360,
      duration: 12,
      repeat: -1,
      ease: 'none',
      transformOrigin: '50% 50%',
    });
    // Dot pulses
    if (missionDot) {
      gsap.to(missionDot, {
        attr: { r: 1.8 },
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
      });
    }
  }

  // ── Vision icon: blinking eye + scanning pupil ─────────────────────────
  const visionLid = document.querySelector('.vision-lid');
  const visionPupil = document.querySelector('.vision-pupil');

  if (visionPupil) {
    // Pupil scans left-right
    gsap.to(visionPupil, {
      attr: { cx: 14 },
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    // Pupil pulses size
    gsap.to(visionPupil, {
      attr: { r: 4 },
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
  }

  if (visionLid) {
    // Blink every 4 seconds — scale the whole eye lid gently
    const blinkTL = gsap.timeline({ repeat: -1, repeatDelay: 3.5 });
    blinkTL.to(visionLid, {
      attr: { d: 'M1 12s4-1 11-1 11 1 11 1-4 1-11 1-11-1-11-1z' },
      duration: 0.12,
      ease: 'power2.in',
    });
    blinkTL.to(visionLid, {
      attr: { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' },
      duration: 0.2,
      ease: 'power2.out',
    });
  }

  // ── What We Do icon: check draws in + arc rotates ──────────────────────
  const wwdArc = document.querySelector('.wwd-arc');
  const wwdCheck = document.querySelector('.wwd-check');

  if (wwdCheck) {
    // Get the path length for stroke-dasharray animation
    const checkLen = wwdCheck.getTotalLength ? wwdCheck.getTotalLength() : 30;
    gsap.set(wwdCheck, { strokeDasharray: checkLen, strokeDashoffset: checkLen });

    // Infinite draw-in / draw-out loop
    gsap.to(wwdCheck, {
      strokeDashoffset: 0,
      duration: 1.2,
      repeat: -1,
      repeatDelay: 2,
      yoyo: true,
      ease: 'power2.inOut',
    });
  }

  if (wwdArc) {
    // Arc rotates continuously
    gsap.to('#aboutIconWhatWeDo svg', {
      rotation: 360,
      duration: 8,
      repeat: -1,
      ease: 'none',
      transformOrigin: '50% 50%',
    });
  }
})();

(function initVelocityReveals() {
  if (typeof Velocity === 'undefined') return;

  // Cards, features, steps, security items — smooth springy entrance
  const revealTargets = document.querySelectorAll(
    '.about-card, .product-card, .feature, .step, .security-item, .horizontal-card, .no-app-card'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        Velocity(entry.target, {
          opacity: [1, 0],
          translateY: [0, 50],
          scale: [1, 0.92],
        }, {
          duration: 800,
          easing: [0.34, 1.56, 0.64, 1], // spring easing
          delay: parseInt(entry.target.dataset.delay || '0') * 1000,
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach((el) => {
    // Only apply if GSAP hasn't already handled it (check if opacity is 0)
    const computed = window.getComputedStyle(el);
    if (computed.opacity !== '0') {
      el.style.opacity = '0';
      el.style.transform = 'translateY(50px) scale(0.92)';
    }
    observer.observe(el);
  });

  // Smooth hover micro-interactions for buttons (mobile-friendly)
  document.querySelectorAll('.btn, .store-btn, .nav-cta').forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      Velocity(btn, { scale: 1.03 }, { duration: 200, easing: 'easeOutQuad' });
    });
    btn.addEventListener('mouseleave', () => {
      Velocity(btn, { scale: 1 }, { duration: 300, easing: 'easeOutQuad' });
    });
  });

  // Smooth stat counter pulse on scroll
  document.querySelectorAll('.stat, .about-stat').forEach((stat) => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          Velocity(entry.target, {
            scale: [1, 0.85],
            opacity: [1, 0],
          }, {
            duration: 600,
            easing: [0.22, 1, 0.36, 1],
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    stat.style.opacity = '0';
    obs.observe(stat);
  });
})();

// ══════════════════════════════════════════════════════════════════════════
// Three.js — Interactive 3D Globe (About section)
// ══════════════════════════════════════════════════════════════════════════
(function initGlobe() {
  const canvas = document.getElementById('aboutGlobe');
  if (!canvas || typeof THREE === 'undefined') return;
  const prefRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefRM) return;

  const size = canvas.clientWidth || 320;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 2.8;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(size, size);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Globe sphere — faint wireframe grid
  const globeGeo = new THREE.SphereGeometry(1, 40, 40);
  const globeMat = new THREE.MeshBasicMaterial({
    color: 0xD4AF37,
    wireframe: true,
    transparent: true,
    opacity: 0.06,
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  scene.add(globe);

  // Inner solid sphere — dark core
  const innerGeo = new THREE.SphereGeometry(0.97, 32, 32);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x0a0a0a,
    transparent: true,
    opacity: 0.92,
  });
  scene.add(new THREE.Mesh(innerGeo, innerMat));

  // ── Continent outlines — dense lat/lon point cloud ─────────────────────
  // Each array is [lat, lon] pairs tracing continent coastlines
  const AFRICA = [
    [37.1,-9.5],[36.8,-2.2],[37.5,10],[33,12],[32,24],[31.5,32],[29,33],[22,36.5],[18,38],[15,43],[12,45],[11.5,51],
    [5,49],[2,45],[-1,42],[-5,40],[-10,40],[-15,41],[-20,44],[-25.5,35],[-30,31],[-34,26],[-34.5,20],[-33,18],
    [-29,16.5],[-22,14],[-17,12],[-12,14],[-5,12],[0,10],[5,5],[5,1],[6,-2],[5,-5],[4,-8],[5,-11],[7,-13],
    [10,-16],[13,-17],[15,-17],[18,-16],[21,-17],[25,-15],[30,-10],[33,-8],[35,-6],[36,-5],[37.1,-9.5],
    // Interior detail
    [10,0],[12,3],[15,10],[20,15],[25,25],[20,30],[15,32],[10,35],[5,30],[0,25],[-5,20],[-10,25],[-15,30],[-20,35],
    [8,38],[6,35],[4,32],[2,28],[0,30],[-3,33],[-8,35],[-12,35],[-15,35],[-20,32],[-25,30],[-28,28],[-30,25],
  ];
  const EUROPE = [
    [36,-9],[38,-7],[40,-9],[43,-9],[44,-1],[46,0],[48,-5],[51,-5],[52,2],[54,8],[57,10],[60,5],[62,6],[65,14],
    [70,20],[72,28],[70,32],[65,30],[60,25],[55,22],[52,20],[48,18],[45,15],[42,20],[40,25],[38,24],[37,22],[36,15],
    [38,12],[40,15],[42,13],[44,10],[45,7],[44,3],[42,3],[40,0],[38,-2],[36,-5],[36,-9],
  ];
  const ASIA = [
    [42,27],[45,40],[40,50],[37,55],[25,57],[23,60],[20,63],[25,67],[30,70],[35,72],[40,68],[45,60],[50,55],
    [55,60],[60,70],[65,80],[70,90],[65,105],[60,120],[55,135],[50,140],[45,142],[40,140],[35,137],[30,130],
    [25,120],[22,115],[20,107],[15,100],[10,105],[5,103],[1,104],[-6,106],[-8,115],[0,118],[5,120],[10,115],
    [15,110],[20,110],[25,100],[30,95],[28,85],[25,80],[20,73],[15,75],[10,78],[8,77],[12,80],[15,80],
    [20,72],[25,68],[30,65],[32,55],[30,50],[35,45],[40,40],[42,27],
  ];
  const NAMERICA = [
    [70,-165],[65,-170],[60,-165],[55,-160],[50,-130],[48,-125],[40,-124],[35,-120],[30,-118],[25,-110],
    [20,-105],[15,-92],[15,-87],[18,-88],[21,-87],[22,-80],[25,-80],[30,-85],[30,-90],[33,-95],[35,-95],
    [40,-75],[42,-70],[45,-65],[48,-60],[50,-55],[55,-60],[60,-65],[65,-60],[70,-70],[72,-80],[70,-95],
    [65,-100],[60,-110],[65,-140],[70,-160],[70,-165],
  ];
  const SAMERICA = [
    [12,-72],[10,-75],[8,-77],[5,-77],[0,-80],[-5,-80],[-10,-77],[-15,-75],[-20,-70],[-25,-65],
    [-30,-58],[-35,-57],[-40,-65],[-45,-65],[-50,-70],[-55,-68],[-55,-65],[-52,-60],[-48,-55],
    [-40,-55],[-35,-50],[-30,-50],[-25,-45],[-20,-40],[-15,-40],[-10,-37],[-5,-35],[0,-50],
    [5,-60],[8,-62],[10,-67],[12,-72],
  ];
  const AUSTRALIA = [
    [-12,130],[-15,125],[-20,118],[-25,114],[-30,115],[-33,118],[-35,135],[-38,145],[-37,150],
    [-33,152],[-28,153],[-22,150],[-18,146],[-15,145],[-12,142],[-10,135],[-12,130],
  ];

  const continents = [
    { pts: AFRICA, color: 0xD4AF37, size: 0.015, opacity: 0.8, step: 3 },
    { pts: EUROPE, color: 0xD4AF37, size: 0.012, opacity: 0.5, step: 3 },
    { pts: ASIA, color: 0xD4AF37, size: 0.012, opacity: 0.45, step: 4 },
    { pts: NAMERICA, color: 0xD4AF37, size: 0.012, opacity: 0.45, step: 4 },
    { pts: SAMERICA, color: 0xD4AF37, size: 0.012, opacity: 0.45, step: 3 },
    { pts: AUSTRALIA, color: 0xD4AF37, size: 0.011, opacity: 0.4, step: 3 },
  ];

  const continentGroup = new THREE.Group();

  // Plot points and also fill between outline points
  continents.forEach(({ pts, color, size, opacity, step: fillStep }) => {
    // Outline dots
    pts.forEach(([lat, lon]) => {
      const vec = latLonToVec3(lat, lon, 1.005);
      const dotGeo = new THREE.SphereGeometry(size, 6, 6);
      const dotMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(vec);
      continentGroup.add(dot);
    });

    // Fill interior with scattered dots for visible landmass
    if (pts.length > 4) {
      const minLat = Math.min(...pts.map(p => p[0]));
      const maxLat = Math.max(...pts.map(p => p[0]));
      const minLon = Math.min(...pts.map(p => p[1]));
      const maxLon = Math.max(...pts.map(p => p[1]));
      const step = fillStep || 4;
      const fillOpacity = opacity * 0.5;

      for (let lat = minLat; lat <= maxLat; lat += step) {
        for (let lon = minLon; lon <= maxLon; lon += step) {
          // Simple point-in-polygon (ray casting)
          let inside = false;
          for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const [yi, xi] = pts[i];
            const [yj, xj] = pts[j];
            if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
              inside = !inside;
            }
          }
          if (inside) {
            const vec = latLonToVec3(lat, lon, 1.004);
            const dGeo = new THREE.SphereGeometry(size * 0.7, 4, 4);
            const dMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: fillOpacity });
            const d = new THREE.Mesh(dGeo, dMat);
            d.position.copy(vec);
            continentGroup.add(d);
          }
        }
      }
    }
  });
  scene.add(continentGroup);

  // Key city markers (larger, brighter)
  const dotPositions = [
    { lat: 5.6, lon: -0.2 },    // Accra, Ghana
    { lat: 6.5, lon: 3.4 },     // Lagos, Nigeria
    { lat: -1.3, lon: 36.8 },   // Nairobi, Kenya
    { lat: -33.9, lon: 18.4 },  // Cape Town, SA
    { lat: -26.2, lon: 28.0 },  // Johannesburg, SA
    { lat: 30.0, lon: 31.2 },   // Cairo, Egypt
    { lat: 14.7, lon: -17.5 },  // Dakar, Senegal
    { lat: -4.3, lon: 15.3 },   // Kinshasa, DRC
    { lat: 9.0, lon: 38.7 },    // Addis Ababa, Ethiopia
    { lat: 0.3, lon: 32.6 },    // Kampala, Uganda
    { lat: -6.8, lon: 39.3 },   // Dar es Salaam, Tanzania
    { lat: 33.9, lon: -6.9 },   // Rabat, Morocco
  ];

  function latLonToVec3(lat, lon, radius) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  const dotGroup = new THREE.Group();
  dotPositions.forEach((pos) => {
    const vec = latLonToVec3(pos.lat, pos.lon, 1.01);
    const dotGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37 });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.copy(vec);
    dotGroup.add(dot);

    // Pulse ring around each dot
    const ringGeo = new THREE.RingGeometry(0.025, 0.04, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xD4AF37,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(vec);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    ring._baseScale = 1;
    ring._phase = Math.random() * Math.PI * 2;
    dotGroup.add(ring);
  });
  scene.add(dotGroup);

  // Connection arcs between some cities
  const arcPairs = [[0, 1], [1, 3], [2, 4], [0, 8], [5, 6], [2, 10]];
  arcPairs.forEach(([a, b]) => {
    const start = latLonToVec3(dotPositions[a].lat, dotPositions[a].lon, 1.01);
    const end = latLonToVec3(dotPositions[b].lat, dotPositions[b].lon, 1.01);
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(1.3);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(32);
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({ color: 0xD4AF37, transparent: true, opacity: 0.15 });
    scene.add(new THREE.Line(lineGeo, lineMat));
  });

  // Mouse drag rotation
  let isDragging = false;
  let prevX = 0, rotVelX = 0;

  canvas.addEventListener('mousedown', (e) => { isDragging = true; prevX = e.clientX; });
  canvas.addEventListener('touchstart', (e) => { isDragging = true; prevX = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('touchend', () => { isDragging = false; });
  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    rotVelX = (e.clientX - prevX) * 0.005;
    prevX = e.clientX;
  });
  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    rotVelX = (e.touches[0].clientX - prevX) * 0.005;
    prevX = e.touches[0].clientX;
  }, { passive: true });

  let isActive = false;

  function animate() {
    if (!isActive) { requestAnimationFrame(animate); return; }

    // Auto-rotate + drag momentum
    const autoSpeed = isDragging ? 0 : 0.002;
    rotVelX *= 0.95; // dampen drag
    globe.rotation.y += autoSpeed + rotVelX;
    dotGroup.rotation.y = globe.rotation.y;
    continentGroup.rotation.y = globe.rotation.y;

    // Pulse the rings
    dotGroup.children.forEach((child) => {
      if (child._phase !== undefined) {
        const t = performance.now() * 0.001;
        const pulse = 1 + 0.4 * Math.sin(t * 2 + child._phase);
        child.scale.setScalar(pulse);
        child.material.opacity = 0.15 + 0.15 * Math.sin(t * 2 + child._phase);
      }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  ScrollTrigger.create({
    trigger: '#about',
    start: 'top bottom',
    end: 'bottom top',
    onEnter: () => { isActive = true; },
    onLeave: () => { isActive = false; },
    onEnterBack: () => { isActive = true; },
    onLeaveBack: () => { isActive = false; },
  });

  requestAnimationFrame(animate);

  window.addEventListener('resize', () => {
    const s = canvas.clientWidth || 320;
    renderer.setSize(s, s);
  });
})();

// ══════════════════════════════════════════════════════════════════════════
// Anime.js — Smooth entrance animations + staggered reveals
// ══════════════════════════════════════════════════════════════════════════
(function initAnimeAnimations() {
  if (typeof anime === 'undefined') return;

  // ── Section tag text — letter-by-letter reveal on scroll ──────────────
  const sectionTags = document.querySelectorAll('.section-tag');
  const tagObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const text = el.textContent;
      el.innerHTML = text.split('').map((c) =>
        c === ' ' ? ' ' : `<span style="display:inline-block;opacity:0">${c}</span>`
      ).join('');
      anime({
        targets: el.querySelectorAll('span'),
        opacity: [0, 1],
        translateY: [10, 0],
        easing: 'easeOutExpo',
        duration: 600,
        delay: anime.stagger(30),
      });
      tagObserver.unobserve(el);
    });
  }, { threshold: 0.5 });
  sectionTags.forEach((tag) => tagObserver.observe(tag));

  // ── Stat numbers — count up with anime.js spring ──────────────────────
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count) || 0;
      const obj = { val: 0 };
      anime({
        targets: obj,
        val: target,
        round: 1,
        easing: 'easeOutExpo',
        duration: 2000,
        update: () => {
          el.textContent = obj.val.toLocaleString();
        },
      });
      statObserver.unobserve(el);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-count]').forEach((el) => statObserver.observe(el));

  // ── NFC teaser — pulse animation ──────────────────────────────────────
  const nfcIcon = document.querySelector('.nfc-icon');
  if (nfcIcon) {
    anime({
      targets: '.nfc-icon path',
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      duration: 1500,
      delay: anime.stagger(300),
      loop: true,
      direction: 'alternate',
    });
  }

  // ── Hero badge dot — breathing pulse ──────────────────────────────────
  anime({
    targets: '.hero-badge-dot',
    scale: [1, 1.5],
    opacity: [1, 0.4],
    easing: 'easeInOutSine',
    duration: 1500,
    loop: true,
    direction: 'alternate',
  });

  // ── Hero title lines — staggered slide-up on load ──────────────────────
  anime({
    targets: '.hero-line',
    translateY: [60, 0],
    opacity: [0, 1],
    easing: 'easeOutExpo',
    duration: 1200,
    delay: anime.stagger(200, { start: 800 }),
  });

  // ── Hero CTA buttons — spring entrance ────────────────────────────────
  anime({
    targets: '.hero-ctas .btn',
    translateY: [30, 0],
    opacity: [0, 1],
    scale: [0.9, 1],
    easing: 'spring(1, 80, 10, 0)',
    delay: anime.stagger(150, { start: 1600 }),
  });

  // ── Card feature list items — staggered slide-in on scroll ────────────
  const listObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      anime({
        targets: entry.target.querySelectorAll('li'),
        translateX: [-20, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 600,
        delay: anime.stagger(80),
      });
      listObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.card-features, .phone-feature-list').forEach((ul) => listObserver.observe(ul));

  // ── Horizontal card icons — rotate in on scroll ───────────────────────
  const hCardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const icon = entry.target.querySelector('.h-card-icon svg');
      if (icon) {
        anime({
          targets: icon,
          rotate: ['-90deg', '0deg'],
          scale: [0, 1],
          opacity: [0, 1],
          easing: 'spring(1, 80, 12, 0)',
          duration: 1000,
        });
      }
      hCardObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.horizontal-card').forEach((card) => hCardObserver.observe(card));

  // ── Feature icons — draw-in SVG strokes on scroll ─────────────────────
  const featureObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const paths = entry.target.querySelectorAll('.feature-icon-wrap svg path, .feature-icon-wrap svg rect, .feature-icon-wrap svg circle, .feature-icon-wrap svg line, .feature-icon-wrap svg polyline');
      if (paths.length) {
        anime({
          targets: paths,
          strokeDashoffset: [anime.setDashoffset, 0],
          easing: 'easeInOutQuad',
          duration: 1200,
          delay: anime.stagger(100),
        });
      }
      featureObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.feature').forEach((f) => featureObserver.observe(f));

  // ── Security grid items — flip-in entrance ────────────────────────────
  const secObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      anime({
        targets: entry.target,
        rotateY: [90, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 800,
      });
      secObserver.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.security-item').forEach((item) => {
    item.style.opacity = '0';
    secObserver.observe(item);
  });

  // ── Step numbers — bounce in ──────────────────────────────────────────
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const num = entry.target.querySelector('.step-number span');
      if (num) {
        anime({
          targets: num,
          scale: [0, 1],
          rotate: ['45deg', '0deg'],
          easing: 'spring(1, 70, 10, 0)',
          duration: 800,
        });
      }
      const content = entry.target.querySelector('.step-content');
      if (content) {
        anime({
          targets: content.children,
          translateY: [20, 0],
          opacity: [0, 1],
          easing: 'easeOutExpo',
          duration: 600,
          delay: anime.stagger(100, { start: 200 }),
        });
      }
      stepObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.step').forEach((s) => stepObserver.observe(s));

  // ── Phone labels — slide up with spring ───────────────────────────────
  const phoneLabelObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      anime({
        targets: entry.target,
        translateY: [15, 0],
        opacity: [0, 1],
        easing: 'spring(1, 80, 10, 0)',
        duration: 800,
      });
      phoneLabelObs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.phone-label').forEach((lbl) => {
    lbl.style.opacity = '0';
    phoneLabelObs.observe(lbl);
  });

  // ── Footer columns — waterfall stagger ────────────────────────────────
  const footerObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      anime({
        targets: entry.target.querySelectorAll('.footer-col'),
        translateY: [30, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 700,
        delay: anime.stagger(120),
      });
      anime({
        targets: entry.target.querySelectorAll('.footer-col a'),
        translateX: [-10, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 500,
        delay: anime.stagger(40, { start: 300 }),
      });
      footerObs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  const footerLinks = document.querySelector('.footer-links');
  if (footerLinks) footerObs.observe(footerLinks);

  // ── Showcase CTA tagline — word-by-word reveal ────────────────────────
  const tagline = document.querySelector('.showcase-tagline');
  if (tagline) {
    const taglineObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const words = tagline.textContent.split(' ');
        tagline.innerHTML = words.map((w) =>
          `<span style="display:inline-block;opacity:0;margin-right:4px">${w}</span>`
        ).join('');
        anime({
          targets: tagline.querySelectorAll('span'),
          opacity: [0, 1],
          translateY: [12, 0],
          easing: 'easeOutExpo',
          duration: 500,
          delay: anime.stagger(50),
        });
        taglineObs.unobserve(tagline);
      });
    }, { threshold: 0.5 });
    taglineObs.observe(tagline);
  }

  // ── Registration form fields — stagger entrance on scroll ─────────────
  const regForm = document.getElementById('sellerRegForm');
  if (regForm) {
    const regObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        anime({
          targets: regForm.querySelectorAll('.reg-field, .reg-row, .reg-terms, .reg-submit'),
          translateY: [20, 0],
          opacity: [0, 1],
          easing: 'easeOutExpo',
          duration: 600,
          delay: anime.stagger(60),
        });
        regObs.unobserve(regForm);
      });
    }, { threshold: 0.1 });
    regObs.observe(regForm);
  }

  // ── Download section store buttons — elastic pop ──────────────────────
  const dlObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      anime({
        targets: entry.target.querySelectorAll('.store-btn'),
        scale: [0.8, 1],
        opacity: [0, 1],
        easing: 'spring(1, 60, 12, 0)',
        delay: anime.stagger(150),
      });
      dlObs.unobserve(entry.target);
    });
  }, { threshold: 0.3 });
  const dlBtns = document.querySelector('.download-buttons');
  if (dlBtns) {
    dlBtns.querySelectorAll('.store-btn').forEach((b) => { b.style.opacity = '0'; });
    dlObs.observe(dlBtns);
  }

  // ── Continuous: nav links subtle letter-spacing pulse ──────────────────
  anime({
    targets: '.nav-link',
    letterSpacing: ['0em', '0.04em'],
    easing: 'easeInOutSine',
    duration: 3000,
    loop: true,
    direction: 'alternate',
    delay: anime.stagger(400),
  });

  // ── Continuous: scroll indicator line pulse ───────────────────────────
  anime({
    targets: '.scroll-line',
    scaleY: [0.5, 1],
    opacity: [0.3, 1],
    easing: 'easeInOutSine',
    duration: 1500,
    loop: true,
    direction: 'alternate',
  });

  // ── Buyer CTA — QR code blocks stagger reveal + feature checkmarks ───
  const buyerCtaObs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      // QR code blocks fade in with stagger
      anime({
        targets: '#buyerCtaQr rect',
        opacity: [0, function(el) { return parseFloat(el.getAttribute('opacity')) || 0.3; }],
        scale: [0.5, 1],
        easing: 'easeOutExpo',
        duration: 800,
        delay: anime.stagger(60),
      });

      // QR frame corners draw in
      anime({
        targets: '#buyerCtaQr path',
        strokeDashoffset: [anime.setDashoffset, 0],
        easing: 'easeInOutQuad',
        duration: 1200,
        delay: anime.stagger(100, { start: 300 }),
      });

      // Feature items slide in
      anime({
        targets: '.buyer-feature',
        translateX: [-30, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 700,
        delay: anime.stagger(120, { start: 500 }),
      });

      // Store buttons elastic pop
      anime({
        targets: '.buyer-cta-buttons .store-btn',
        scale: [0.8, 1],
        opacity: [0, 1],
        easing: 'spring(1, 70, 10, 0)',
        delay: anime.stagger(150, { start: 900 }),
      });

      buyerCtaObs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  const buyerCta = document.getElementById('buyerCta');
  if (buyerCta) {
    buyerCta.querySelectorAll('.buyer-feature, .buyer-cta-buttons .store-btn').forEach((el) => {
      el.style.opacity = '0';
    });
    buyerCtaObs.observe(buyerCta);
  }

  // ── Buyer QR — continuous shimmer on QR blocks ────────────────────────
  anime({
    targets: '#buyerCtaQr rect[fill="#D4AF37"]',
    opacity: [
      { value: function(el) { return (parseFloat(el.getAttribute('opacity')) || 0.2) * 0.5; }, duration: 1500 },
      { value: function(el) { return parseFloat(el.getAttribute('opacity')) || 0.2; }, duration: 1500 },
    ],
    easing: 'easeInOutSine',
    loop: true,
    delay: anime.stagger(100),
  });

  // ── Continuous: about card icon containers subtle rotate ──────────────
  anime({
    targets: '.about-card-icon',
    rotate: ['-2deg', '2deg'],
    easing: 'easeInOutSine',
    duration: 4000,
    loop: true,
    direction: 'alternate',
    delay: anime.stagger(600),
  });

  // ── Continuous: horizontal card icons — each unique infinite animation ─
  const hCards = document.querySelectorAll('.horizontal-card');

  // QR Payments — scanning pulse on the grid
  if (hCards[0]) {
    anime({
      targets: hCards[0].querySelectorAll('.h-card-icon svg rect'),
      opacity: [1, 0.4],
      easing: 'easeInOutSine',
      duration: 1200,
      loop: true,
      direction: 'alternate',
      delay: anime.stagger(150),
    });
    anime({
      targets: hCards[0].querySelectorAll('.h-card-icon svg path'),
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutQuad',
      duration: 2000,
      loop: true,
      direction: 'alternate',
    });
  }

  // Mobile Money — phone bobbing + screen dot pulse
  if (hCards[1]) {
    anime({
      targets: hCards[1].querySelector('.h-card-icon svg'),
      translateY: [-2, 2],
      easing: 'easeInOutSine',
      duration: 2000,
      loop: true,
      direction: 'alternate',
    });
    anime({
      targets: hCards[1].querySelectorAll('.h-card-icon svg path'),
      opacity: [0.4, 1],
      scale: [1, 1.5],
      easing: 'easeInOutSine',
      duration: 1000,
      loop: true,
      direction: 'alternate',
    });
  }

  // Saved Cards — card swipe slide + stripe shimmer
  if (hCards[2]) {
    anime({
      targets: hCards[2].querySelector('.h-card-icon svg rect'),
      translateX: [-2, 2],
      easing: 'easeInOutSine',
      duration: 3000,
      loop: true,
      direction: 'alternate',
    });
    anime({
      targets: hCards[2].querySelectorAll('.h-card-icon svg line'),
      strokeDashoffset: [anime.setDashoffset, 0],
      opacity: [0.3, 1],
      easing: 'easeInOutQuad',
      duration: 1500,
      loop: true,
      direction: 'alternate',
      delay: anime.stagger(200),
    });
  }

  // Wallet — open/close breathing
  if (hCards[3]) {
    anime({
      targets: hCards[3].querySelectorAll('.h-card-icon svg path'),
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      duration: 2500,
      loop: true,
      direction: 'alternate',
      delay: anime.stagger(300),
    });
    anime({
      targets: hCards[3].querySelector('.h-card-icon svg'),
      scale: [1, 1.06],
      easing: 'easeInOutSine',
      duration: 2000,
      loop: true,
      direction: 'alternate',
    });
  }

  // Seller Dashboard — bars growing
  if (hCards[4]) {
    anime({
      targets: hCards[4].querySelectorAll('.h-card-icon svg path'),
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutQuad',
      duration: 1800,
      loop: true,
      direction: 'alternate',
      delay: anime.stagger(200),
    });
    anime({
      targets: hCards[4].querySelector('.h-card-icon svg'),
      rotate: ['-1deg', '1deg'],
      easing: 'easeInOutSine',
      duration: 3000,
      loop: true,
      direction: 'alternate',
    });
  }
})();

// ══════════════════════════════════════════════════════════════════════════
// PARALLAX SCROLL — Vivid depth layers, scrubbed to scroll position
// Each section has its own depth and speed, creating a rich layered feel
// ══════════════════════════════════════════════════════════════════════════
(function initParallaxLayers() {
  if (prefersReducedMotion) return;

  // ── Hero depth layers — content recedes as you leave ──────────────────
  const heroContent = document.querySelector('.hero-content');
  const heroShield = document.querySelector('.hero-shield-wrap');
  const heroPhotoBg = document.getElementById('heroPhotoBg');

  if (heroContent) {
    gsap.to(heroContent, {
      y: -60,
      scale: 0.96,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: '60% center', end: 'bottom top', scrub: true },
    });
  }
  if (heroShield) {
    gsap.to(heroShield, {
      y: -40,
      opacity: 0.3,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: '60% center', end: 'bottom top', scrub: true },
    });
  }
  if (heroPhotoBg) {
    gsap.to(heroPhotoBg, {
      y: 100,
      scale: 1.08,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // ── Section headings — each rises at different speed than its content ──
  document.querySelectorAll('.section-header').forEach((header) => {
    gsap.from(header, {
      y: 60,
      ease: 'none',
      scrollTrigger: {
        trigger: header,
        start: 'top 95%',
        end: 'top 40%',
        scrub: 1.5,
      },
    });
  });

  // ── About cards — staggered depth ─────────────────────────────────────
  document.querySelectorAll('.about-card').forEach((card, i) => {
    gsap.from(card, {
      y: 80 + i * 30,
      ease: 'none',
      scrollTrigger: {
        trigger: card,
        start: 'top bottom',
        end: 'top 50%',
        scrub: 1.5,
      },
    });
  });

  // ── Phone mockups — opposite direction parallax ───────────────────────
  const phoneLeft = document.querySelector('.phone-left');
  const phoneRight = document.querySelector('.phone-right');
  if (phoneLeft && !isMobile) {
    gsap.from(phoneLeft, {
      x: -80, y: 100, rotation: -8,
      ease: 'none',
      scrollTrigger: { trigger: '.phone-showcase', start: 'top bottom', end: 'top 20%', scrub: 1.5 },
    });
  }
  if (phoneRight && !isMobile) {
    gsap.from(phoneRight, {
      x: 80, y: 120, rotation: 8,
      ease: 'none',
      scrollTrigger: { trigger: '.phone-showcase', start: 'top bottom', end: 'top 20%', scrub: 1.5 },
    });
  }

  // ── Features grid — cards rise at staggered speeds ────────────────────
  document.querySelectorAll('.feature').forEach((feat, i) => {
    gsap.from(feat, {
      y: 50 + (i % 3) * 25,
      ease: 'none',
      scrollTrigger: {
        trigger: feat,
        start: 'top bottom',
        end: 'top 55%',
        scrub: 1.5,
      },
    });
  });

  // ── Steps — cascade entry from alternating sides ──────────────────────
  document.querySelectorAll('.step').forEach((step, i) => {
    gsap.from(step, {
      x: i % 2 === 0 ? -40 : 40,
      y: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: step,
        start: 'top bottom',
        end: 'top 60%',
        scrub: 1.5,
      },
    });
  });

  // ── Security items — scale up from small ──────────────────────────────
  document.querySelectorAll('.security-item').forEach((item, i) => {
    gsap.from(item, {
      scale: 0.85,
      y: 40,
      ease: 'none',
      scrollTrigger: {
        trigger: item,
        start: 'top bottom',
        end: 'top 65%',
        scrub: 1.5,
      },
    });
  });

  // ── Padlock — rotates and scales on scroll ────────────────────────────
  const securityLock = document.getElementById('securityLock');
  if (securityLock) {
    gsap.from(securityLock, {
      rotation: -20,
      scale: 0.7,
      y: 60,
      ease: 'none',
      scrollTrigger: {
        trigger: '#security',
        start: 'top bottom',
        end: 'top 30%',
        scrub: 1.5,
      },
    });
  }

  // ── Register form card — perspective zoom ─────────────────────────────
  const regCard = document.querySelector('.reg-card');
  if (regCard) {
    gsap.from(regCard, {
      y: 80,
      scale: 0.9,
      rotateX: 4,
      ease: 'none',
      scrollTrigger: {
        trigger: '#register',
        start: 'top bottom',
        end: 'top 30%',
        scrub: 1.5,
      },
    });
  }

  // ── Footer — rises into view with depth ───────────────────────────────
  const footer = document.querySelector('.footer');
  if (footer) {
    gsap.from(footer, {
      y: 50,
      opacity: 0.5,
      ease: 'none',
      scrollTrigger: {
        trigger: footer,
        start: 'top bottom',
        end: 'top 70%',
        scrub: 1.5,
      },
    });
  }
})();

// ══════════════════════════════════════════════════════════════════════════
// SHUTTER REVEAL + SCROLL COLOR SHIFT (Evolve-inspired)
// ══════════════════════════════════════════════════════════════════════════
(function initShutterAndColorShift() {
  // ── Shutter reveal — venetian-blind open on scroll ────────────────────
  const shutterSections = document.querySelectorAll('.shutter-reveal');
  shutterSections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 85%',
      once: true,
      onEnter: () => section.classList.add('shutter-open'),
    });
  });

  // ── Background color shift — body transitions between themes ──────────
  const themedSections = document.querySelectorAll('[data-theme]');
  themedSections.forEach((section) => {
    const theme = section.dataset.theme; // 'warm' or 'dark'
    ScrollTrigger.create({
      trigger: section,
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => {
        document.body.classList.remove('theme-warm', 'theme-dark');
        document.body.classList.add('theme-' + theme);
      },
      onEnterBack: () => {
        document.body.classList.remove('theme-warm', 'theme-dark');
        document.body.classList.add('theme-' + theme);
      },
    });
  });

  // Reset to default dark when scrolling back to hero
  ScrollTrigger.create({
    trigger: '#hero',
    start: 'top 60%',
    onEnterBack: () => {
      document.body.classList.remove('theme-warm', 'theme-dark');
    },
  });
})();

