/* ═══════════════════════════════════════════════════════════════════════════
   SIKANI TECHNOLOGIES — Landing Page Interactions
   GSAP + ScrollTrigger + Lenis + Three.js + Custom cursor
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Register GSAP Plugins ─────────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ── Lenis Smooth Scroll ───────────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync Lenis with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

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
    if (target) lenis.scrollTo(target, { offset: -80 });
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle system — gold floating particles
  const particleCount = 800;
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

  // Hero text reveal
  gsap.from('.hero-line', {
    y: 80,
    opacity: 0,
    rotationX: -15,
    stagger: 0.12,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.2,
  });

  // Reveal elements on scroll
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    const delay = parseFloat(el.dataset.delay || 0);
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      delay,
      ease: 'power3.out',
    });
  });

  // Section titles
  gsap.utils.toArray('[data-split]').forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    });
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

  // Feature cards stagger
  gsap.from('.feature', {
    scrollTrigger: {
      trigger: '.features-grid',
      start: 'top 80%',
    },
    y: 40,
    opacity: 0,
    stagger: 0.1,
    duration: 0.6,
    ease: 'power3.out',
  });

  // Steps animation
  gsap.utils.toArray('.step').forEach((step, i) => {
    gsap.from(step, {
      scrollTrigger: {
        trigger: step,
        start: 'top 80%',
      },
      x: -30,
      opacity: 0,
      duration: 0.6,
      delay: i * 0.15,
      ease: 'power3.out',
    });
  });

  // Security items
  gsap.from('.security-item', {
    scrollTrigger: {
      trigger: '.security-grid',
      start: 'top 80%',
    },
    y: 30,
    opacity: 0,
    stagger: 0.1,
    duration: 0.5,
    ease: 'power3.out',
  });

  // Download section
  gsap.from('.store-btn', {
    scrollTrigger: {
      trigger: '.download-buttons',
      start: 'top 80%',
    },
    y: 20,
    opacity: 0,
    stagger: 0.15,
    duration: 0.6,
    ease: 'power3.out',
  });

  // ── About section cards ──────────────────────────────────────────────
  gsap.from('.about-card', {
    scrollTrigger: {
      trigger: '.about-cards',
      start: 'top 80%',
    },
    y: 50,
    opacity: 0,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out',
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
    // Pin the section while words animate
    ScrollTrigger.create({
      trigger: revealSection,
      start: 'top top',
      end: '+=150%',
      pin: true,
      anticipatePin: 1,
    });

    words.forEach((word, i) => {
      gsap.fromTo(word,
        {
          opacity: 0.08,
          y: 20,
          filter: 'blur(4px)',
        },
        {
          scrollTrigger: {
            trigger: revealSection,
            start: () => 'top+=' + (i * (150 / words.length)) + '% top',
            end: () => 'top+=' + ((i + 1) * (150 / words.length)) + '% top',
            scrub: true,
          },
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          ease: 'power3.out',
        }
      );
    });
  }
}
