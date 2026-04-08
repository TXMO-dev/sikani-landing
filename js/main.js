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

  // Click — smooth scroll to top
  backToTop.addEventListener('click', () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.5 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

if (window.matchMedia('(hover: hover)').matches) {
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

  // Hover states
  document.querySelectorAll('a, button, [data-magnetic]').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
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
    const target = document.querySelector(anchor.getAttribute('href'));
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
    // Use a single timeline pinned to the section for reliable word-by-word reveal
    const revealTl = gsap.timeline({
      scrollTrigger: {
        trigger: revealSection,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
      },
    });

    // Set initial state
    gsap.set(words, { opacity: 0.08, y: 30, filter: 'blur(6px)', scale: 0.95 });

    words.forEach((word, i) => {
      revealTl.to(word, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
        duration: 1,
        ease: 'power2.out',
      }, i * 0.6); // stagger each word
    });

    // Hold the fully revealed text for a beat
    revealTl.to({}, { duration: 2 });

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

  // ── Floating Badges — Bobbing + Parallax ─────────────────────────────
  const badges = document.querySelectorAll('.floating-badge');
  if (badges.length > 0) {
    badges.forEach((badge, i) => {
      // Staggered entrance
      gsap.from(badge, {
        opacity: 0,
        scale: 0.7,
        y: 30,
        duration: 0.8,
        delay: 0.2 + i * 0.15,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: '.phone-showcase',
          start: 'top 70%',
        },
      });

      // Continuous bobbing with offset
      gsap.to(badge, {
        y: '-=12',
        duration: 2 + i * 0.3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.5,
      });
    });

    // Parallax on scroll
    gsap.to('.badge-1', {
      y: -40,
      scrollTrigger: { trigger: '.phone-showcase', start: 'top bottom', end: 'bottom top', scrub: 1 },
    });
    gsap.to('.badge-2', {
      y: -60,
      scrollTrigger: { trigger: '.phone-showcase', start: 'top bottom', end: 'bottom top', scrub: 1 },
    });
    gsap.to('.badge-3', {
      y: -30,
      scrollTrigger: { trigger: '.phone-showcase', start: 'top bottom', end: 'bottom top', scrub: 1 },
    });
    gsap.to('.badge-4', {
      y: -50,
      scrollTrigger: { trigger: '.phone-showcase', start: 'top bottom', end: 'bottom top', scrub: 1 },
    });
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

// ── Form submit handler ──────────────────────────────────────────────────
const sellerRegForm = document.getElementById('sellerRegForm');
if (sellerRegForm) {
  let lastFormData = null;

  sellerRegForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      firstName: document.getElementById('regFirstName').value,
      lastName: document.getElementById('regLastName').value,
      email: document.getElementById('regEmail').value,
      phoneNumber: document.getElementById('regPhone').value,
      businessName: document.getElementById('regBusiness').value,
      password: document.getElementById('regPassword').value,
      confirmPassword: document.getElementById('regConfirmPassword').value,
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
      sellerRegForm.querySelectorAll('input').forEach((inp) => {
        inp.classList.remove('valid', 'invalid');
      });
      sellerRegForm.querySelectorAll('.field-error').forEach((el) => {
        el.textContent = '';
      });
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
