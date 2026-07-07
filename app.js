/* ==========================================================================
   BNO AGRO — app.js
   Vanilla JS ES2025. No dependencies.
   ========================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     Utilities
  ------------------------------------------------------------------ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ------------------------------------------------------------------
     Footer year
  ------------------------------------------------------------------ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------
     Navbar: blur on scroll + hide mobile menu on link click
  ------------------------------------------------------------------ */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  const onScrollNav = () => {
    if (window.scrollY > 40) navbar.classList.add('is-scrolled');
    else navbar.classList.remove('is-scrolled');
  };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  if (navToggle && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    const openMenu = () => {
      mobileMenu.classList.add('is-open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      navToggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    navToggle.addEventListener('click', () => {
      mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    $$('a', mobileMenu).forEach(a => a.addEventListener('click', closeMenu));
  }

  /* ------------------------------------------------------------------
     Scroll reveal via IntersectionObserver
  ------------------------------------------------------------------ */
  const revealTargets = $$('[data-reveal]');
  if ('IntersectionObserver' in window && revealTargets.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------
     Hero title: staggered line reveal on load
  ------------------------------------------------------------------ */
  window.addEventListener('DOMContentLoaded', () => {
    const lines = $$('[data-reveal-text]');
    lines.forEach((line, i) => {
      line.style.transform = 'translateY(110%)';
      line.style.opacity = '0';
      line.style.transition = `transform 1s cubic-bezier(.16,1,.3,1) ${0.15 + i * 0.12}s, opacity .8s ease ${0.15 + i * 0.12}s`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          line.style.transform = 'translateY(0)';
          line.style.opacity = '1';
        });
      });
    });
  });

  /* ------------------------------------------------------------------
     Hero canvas: procedural "field scan" animation
     Simulates an aerial flight path / scan-line grid over a field —
     used in place of external video assets.
  ------------------------------------------------------------------ */
  const canvas = document.getElementById('fieldCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, dpr;
    let particles = [];
    let scanY = 0;
    let flightT = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: Math.round((w * h) / 32000) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.4,
        s: Math.random() * 0.3 + 0.08,
      }));
    };
    resize();
    window.addEventListener('resize', resize);

    const rowSpacing = 46;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Field furrow lines (diagonal, mimics crop rows seen from above)
      ctx.save();
      ctx.strokeStyle = 'rgba(56,224,122,0.07)';
      ctx.lineWidth = 1;
      const offset = (flightT * 22) % rowSpacing;
      for (let x = -h; x < w + h; x += rowSpacing) {
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset - h, h);
        ctx.stroke();
      }
      ctx.restore();

      // Particles = dust / crop texture drifting
      ctx.fillStyle = 'rgba(56,224,122,0.35)';
      particles.forEach(p => {
        p.x -= p.s;
        if (p.x < 0) p.x = w;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Horizontal scan line (drone telemetry sweep)
      scanY += 0.9;
      if (scanY > h + 80) scanY = -80;
      const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
      grad.addColorStop(0, 'rgba(56,224,122,0)');
      grad.addColorStop(0.5, 'rgba(56,224,122,0.14)');
      grad.addColorStop(1, 'rgba(56,224,122,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 60, w, 120);
      ctx.strokeStyle = 'rgba(56,224,122,0.35)';
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();

      flightT += 0.5;
      if (!prefersReducedMotion) requestAnimationFrame(draw);
    };
    draw();
  }

  /* ------------------------------------------------------------------
     Telemetry altitude counter (decorative)
  ------------------------------------------------------------------ */
  const altEl = document.querySelector('[data-counter-alt]');
  if (altEl && !prefersReducedMotion) {
    let alt = 0;
    setInterval(() => {
      alt = 38 + Math.round(Math.sin(Date.now() / 900) * 6);
      altEl.textContent = alt;
    }, 400);
  }

  /* ------------------------------------------------------------------
     Animated counters (stats section)
  ------------------------------------------------------------------ */
  const counters = $$('.stat__num');
  if (counters.length && 'IntersectionObserver' in window) {
    const animateCounter = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      const step = (now) => {
        const p = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(lerp(0, target, eased)).toLocaleString('es-AR') + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterIO.observe(c));
  }

  /* ------------------------------------------------------------------
     Timeline progress bar (fills as the section scrolls into view)
  ------------------------------------------------------------------ */
  const timelineSection = document.getElementById('proceso');
  const timelineProgress = document.getElementById('timelineProgress');
  if (timelineSection && timelineProgress) {
    const onTimelineScroll = () => {
      const rect = timelineSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = clamp((vh - rect.top) / (rect.height + vh * 0.4), 0, 1);
      timelineProgress.style.width = `${progress * 100}%`;
    };
    window.addEventListener('scroll', onTimelineScroll, { passive: true });
    onTimelineScroll();
  }

  /* ------------------------------------------------------------------
     Testimonial slider (auto-playing, dot navigation)
  ------------------------------------------------------------------ */
  const sliderTrack = document.getElementById('sliderTrack');
  const sliderDots = document.getElementById('sliderDots');
  if (sliderTrack && sliderDots) {
    const slides = $$('.slider__card', sliderTrack);
    let index = 0;
    let sliderTimer;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Ver testimonio ${i + 1}`);
      if (i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', () => goTo(i));
      sliderDots.appendChild(dot);
    });

    const dots = $$('button', sliderDots);

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      sliderTrack.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('is-active', di === index));
    }

    function startAutoplay() {
      if (prefersReducedMotion) return;
      sliderTimer = setInterval(() => goTo(index + 1), 5500);
    }
    function stopAutoplay() {
      clearInterval(sliderTimer);
    }

    startAutoplay();
    sliderTrack.addEventListener('mouseenter', stopAutoplay);
    sliderTrack.addEventListener('mouseleave', startAutoplay);

    // Touch swipe
    let touchStartX = 0;
    sliderTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      stopAutoplay();
    }, { passive: true });
    sliderTrack.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (dx > 50) goTo(index - 1);
      else if (dx < -50) goTo(index + 1);
      startAutoplay();
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     FAQ accordion
  ------------------------------------------------------------------ */
  $$('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const panel = trigger.nextElementSibling;
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Close all others
      $$('.accordion__trigger').forEach(t => {
        if (t !== trigger) {
          t.setAttribute('aria-expanded', 'false');
          t.nextElementSibling.style.maxHeight = null;
        }
      });

      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.style.maxHeight = isOpen ? null : `${panel.scrollHeight}px`;
    });
  });

  /* ------------------------------------------------------------------
     Lightbox for gallery
  ------------------------------------------------------------------ */
  const lightbox = document.getElementById('lightbox');
  const lightboxStage = document.getElementById('lightboxStage');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && lightboxStage) {
    $$('.masonry__item').forEach(item => {
      item.addEventListener('click', () => {
        lightboxStage.innerHTML = '';
        const clone = document.createElement('div');
        clone.style.cssText = 'width:100%;height:100%;';
        clone.className = item.className.replace('masonry__item', '').trim();
        clone.setAttribute('data-visual', item.getAttribute('data-visual'));
        clone.style.background = getComputedStyle(item).background;
        lightboxStage.appendChild(clone);

        const caption = document.createElement('p');
        caption.textContent = item.dataset.caption || '';
        caption.style.cssText = 'position:absolute;bottom:1.5rem;left:1.5rem;color:#fff;font-family:var(--font-mono);font-size:.8rem;';
        lightboxStage.appendChild(caption);

        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };
    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ------------------------------------------------------------------
     Magnetic buttons
  ------------------------------------------------------------------ */
  if (!prefersReducedMotion && matchMedia('(hover:hover)').matches) {
    $$('.btn--magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ------------------------------------------------------------------
     Tilt effect for service cards
  ------------------------------------------------------------------ */
  if (!prefersReducedMotion && matchMedia('(hover:hover)').matches) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-py * 4}deg) rotateY(${px * 5}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------------
     Cursor glow (desktop only)
  ------------------------------------------------------------------ */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && matchMedia('(hover:hover)').matches) {
    let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
    let cx = gx, cy = gy;
    window.addEventListener('mousemove', (e) => {
      gx = e.clientX;
      gy = e.clientY;
    });
    const animateGlow = () => {
      cx = lerp(cx, gx, 0.12);
      cy = lerp(cy, gy, 0.12);
      cursorGlow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateGlow);
    };
    if (!prefersReducedMotion) animateGlow();
  }

  /* ------------------------------------------------------------------
     Smooth anchor scrolling with navbar offset
  ------------------------------------------------------------------ */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 90;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

})();
