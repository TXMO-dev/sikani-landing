/**
 * Sikani NFC Card — 3D flip + hover + scroll-driven reveal
 * Awwwards-grade: CSS 3D transform, GSAP ScrollTrigger, particle burst on flip.
 * No Three.js dependency — pure CSS 3D + canvas particles keeps it lightweight.
 */
(function () {
  'use strict';

  /* ── Wait for GSAP ─────────────────────────────────────────────────────── */
  function init() {
    const section = document.getElementById('nfc-card-section');
    if (!section) return;

    const scene    = section.querySelector('.nfc-scene');
    const card     = section.querySelector('.nfc-card');
    const canvas   = section.querySelector('.nfc-particles');
    const tagline  = section.querySelector('.nfc-tagline');
    const sub      = section.querySelector('.nfc-sub');
    const badge    = section.querySelector('.nfc-badge');

    if (!scene || !card) return;

    let isFlipped   = false;
    let autoFlipDone = false;
    let mouseMoveRaf = null;

    /* ── Particle burst canvas ─────────────────────────────────────────── */
    const ctx = canvas ? canvas.getContext('2d') : null;
    let particles = [];

    function resizeCanvas() {
      if (!canvas) return;
      canvas.width  = section.offsetWidth;
      canvas.height = section.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function spawnParticles(x, y, color) {
      const count = 28;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
        const speed = 2.5 + Math.random() * 4;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.022 + Math.random() * 0.012,
          r: 2 + Math.random() * 3,
          color,
        });
      }
    }

    function tickParticles() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle   = p.color;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        p.x    += p.vx;
        p.y    += p.vy;
        p.vx   *= 0.93;
        p.vy   *= 0.93;
        p.life -= p.decay;
      });
      requestAnimationFrame(tickParticles);
    }
    tickParticles();

    /* ── Flip card ─────────────────────────────────────────────────────── */
    function flipCard(instant) {
      isFlipped = !isFlipped;

      // Burst from card centre
      if (canvas) {
        const rect   = card.getBoundingClientRect();
        const srect  = section.getBoundingClientRect();
        const cx = rect.left - srect.left + rect.width  / 2;
        const cy = rect.top  - srect.top  + rect.height / 2;
        const color = isFlipped ? '#1a3a5c' : '#D4AF37';
        spawnParticles(cx, cy, color);
        spawnParticles(cx, cy, isFlipped ? '#FFFFFF' : '#FFD700');
      }

      const deg = isFlipped ? 180 : 0;
      if (instant) {
        card.style.transform = `rotateY(${deg}deg)`;
      } else {
        if (window.gsap) {
          gsap.to(card, { rotateY: deg, duration: 0.9, ease: 'power3.inOut' });
        } else {
          card.style.transform = `rotateY(${deg}deg)`;
        }
      }
    }

    /* ── Auto-flip on scroll enter ─────────────────────────────────────── */
    if (window.gsap && window.ScrollTrigger) {
      // Entrance animation
      gsap.fromTo(
        [tagline, sub, badge],
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
          }
        }
      );

      gsap.fromTo(
        scene,
        { y: 60, opacity: 0, scale: 0.92 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 65%',
            onEnter: () => {
              if (!autoFlipDone) {
                autoFlipDone = true;
                // Brief pause then auto-flip to reveal back
                setTimeout(() => {
                  flipCard(false);
                  // Flip back after 2.4s
                  setTimeout(() => flipCard(false), 2400);
                }, 900);
              }
            }
          }
        }
      );

      // Subtle parallax float while scrolling
      gsap.to(scene, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end:   'bottom top',
          scrub: 1.5,
        }
      });
    }

    /* ── Mouse hover tilt ──────────────────────────────────────────────── */
    const MAX_TILT = 18;
    scene.addEventListener('mousemove', (e) => {
      if (mouseMoveRaf) cancelAnimationFrame(mouseMoveRaf);
      mouseMoveRaf = requestAnimationFrame(() => {
        const rect = scene.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dx   = (e.clientX - cx) / (rect.width  / 2);
        const dy   = (e.clientY - cy) / (rect.height / 2);
        const tiltX =  dy * -MAX_TILT;
        const tiltY =  dx *  MAX_TILT;

        if (window.gsap) {
          gsap.to(card, {
            rotateX: tiltX,
            rotateY: isFlipped ? 180 + tiltY : tiltY,
            duration: 0.4,
            ease: 'power2.out',
          });
        } else {
          card.style.transform = `rotateX(${tiltX}deg) rotateY(${isFlipped ? 180 + tiltY : tiltY}deg)`;
        }

        // Shimmer follow light
        const front = card.querySelector('.nfc-card-front');
        const back  = card.querySelector('.nfc-card-back');
        const pct   = `${(dx + 1) * 50}% ${(dy + 1) * 50}%`;
        if (front) front.style.setProperty('--shine-pos', pct);
        if (back)  back .style.setProperty('--shine-pos', pct);
      });
    });

    scene.addEventListener('mouseleave', () => {
      if (window.gsap) {
        gsap.to(card, {
          rotateX: 0,
          rotateY: isFlipped ? 180 : 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)',
        });
      }
    });

    /* ── Click to flip ─────────────────────────────────────────────────── */
    scene.addEventListener('click', () => flipCard(false));

    /* ── Touch swipe to flip ───────────────────────────────────────────── */
    let touchStartX = 0;
    scene.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    scene.addEventListener('touchend', e => {
      if (Math.abs(e.changedTouches[0].clientX - touchStartX) > 40) flipCard(false);
    }, { passive: true });

    /* ── NFC pulse ring animation ──────────────────────────────────────── */
    const nfcRings = section.querySelectorAll('.nfc-ring');
    nfcRings.forEach((ring, i) => {
      if (!window.gsap) return;
      gsap.to(ring, {
        scale: 1.6 + i * 0.3,
        opacity: 0,
        duration: 1.4 + i * 0.3,
        ease: 'power2.out',
        repeat: -1,
        delay: i * 0.45,
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
