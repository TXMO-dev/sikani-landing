/* ═══════════════════════════════════════════════════════════════════════════
   SIKANI — Shared Page Interactions
   Cursor, Lenis smooth scroll, parallax, grain, ambient effects
   Loaded on ALL pages (blog, careers, terms, privacy)
   ═══════════════════════════════════════════════════════════════════════════ */

const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

gsap.registerPlugin(ScrollTrigger);

// ── Lenis Smooth Scroll ──────────────────────────────────────────────────
const lenis = (typeof Lenis !== 'undefined' && !isMobile) ? new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
}) : null;

if (lenis) {
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// ── Custom Cursor ────────────────────────────────────────────────────────
const cursor = document.getElementById('cursor');
const cursorTrail = document.getElementById('cursor-trail');
let mouseX = 0, mouseY = 0, trailX = 0, trailY = 0;

if (cursor && cursorTrail && window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.15 });
  });

  (function animateTrail() {
    trailX += (mouseX - trailX) * 0.12;
    trailY += (mouseY - trailY) * 0.12;
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top = trailY + 'px';
    requestAnimationFrame(animateTrail);
  })();

  // Event delegation — works on all dynamic elements
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, [data-magnetic], input, textarea, select, .text-link')) {
      cursor.classList.add('hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, [data-magnetic], input, textarea, select, .text-link')) {
      cursor.classList.remove('hover');
    }
  });
}

// ── Magnetic Effect ──────────────────────────────────────────────────────
if (!isMobile) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
      gsap.to(el, { x, y, duration: 0.3, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

// ── Mobile Menu Toggle ───────────────────────────────────────────────────
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });
  mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });
}

// ── Scroll Progress Bar ──────────────────────────────────────────────────
const scrollProgress = document.querySelector('.scroll-progress');
if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    scrollProgress.style.width = Math.min(pct, 100) + '%';
  });
}

// ── Scrollbar Glow Indicator — right-edge gold line that reacts to scroll ─
(function initScrollbarGlow() {
  if (isMobile) return;
  const glow = document.createElement('div');
  glow.id = 'scrollbarGlow';
  glow.style.cssText = 'position:fixed;top:0;right:0;width:6px;height:100vh;z-index:99998;pointer-events:none;opacity:0;transition:opacity 0.3s ease;';
  document.body.appendChild(glow);

  const inner = document.createElement('div');
  inner.style.cssText = 'position:absolute;right:0;width:6px;border-radius:3px;background:linear-gradient(180deg,transparent,rgba(212,175,55,0.5),transparent);transition:top 0.1s ease,height 0.1s ease;box-shadow:0 0 12px rgba(212,175,55,0.3),-2px 0 20px rgba(212,175,55,0.15);';
  glow.appendChild(inner);

  let scrollTimeout;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPct = docHeight > 0 ? scrollTop / docHeight : 0;
    const viewportRatio = window.innerHeight / document.documentElement.scrollHeight;
    const thumbHeight = Math.max(viewportRatio * window.innerHeight, 40);
    const thumbTop = scrollPct * (window.innerHeight - thumbHeight);

    inner.style.top = thumbTop + 'px';
    inner.style.height = thumbHeight + 'px';
    glow.style.opacity = '1';

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => { glow.style.opacity = '0'; }, 1200);
  });
})();

// ── Nav scroll behavior (show/hide + scrolled state) ─────────────────────
const nav = document.getElementById('nav');
if (nav) {
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    lastScroll = y;
  });
}

// ── Parallax on any [data-parallax] element ──────────────────────────────
if (!isMobile && !prefersReducedMotion) {
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) || -0.15;
    gsap.to(el, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  });
}

// ── Velocity.js smooth entrance for sections ─────────────────────────────
if (typeof Velocity !== 'undefined') {
  const revealEls = document.querySelectorAll('.legal-section, .blog-card, .culture-value, .job-row');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        Velocity(entry.target, {
          opacity: [1, 0],
          translateY: [0, 40],
          scale: [1, 0.95],
        }, {
          duration: 700,
          easing: [0.34, 1.56, 0.64, 1],
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach((el) => observer.observe(el));
}

// ── Particle Burst on CTA clicks ─────────────────────────────────────────
if (!prefersReducedMotion) {
  function burst(x, y) {
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      p.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:4px;height:4px;border-radius:50%;background:#D4AF37;pointer-events:none;z-index:100001;`;
      document.body.appendChild(p);
      const angle = (Math.PI * 2 / 16) * i + Math.random() * 0.5;
      const dist = 30 + Math.random() * 60;
      gsap.to(p, {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: Math.random() * 2,
        duration: 0.5 + Math.random() * 0.3,
        ease: 'power3.out',
        onComplete: () => p.remove(),
      });
    }
  }
  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-primary, .nav-cta, .store-btn')) {
      burst(e.clientX, e.clientY);
    }
  });
}
