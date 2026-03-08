/* ══ Gift City — main.js ══════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Nav scroll effect ──────────────────────────── */
  const nav = document.querySelector('nav');
  const onScroll = () => {
    nav && (nav.classList.toggle('scrolled', window.scrollY > 60));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── 2. Mobile nav toggle ──────────────────────────── */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
    // Close on outside click
    document.addEventListener('click', e => {
      if (!nav.contains(e.target)) {
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ── 3. Scroll reveal ──────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Don't unobserve — keeps state on back-nav
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ── 4. Flip card ──────────────────────────────────── */
  const flipCard = document.querySelector('.flip-card');
  if (flipCard) {
    flipCard.addEventListener('click', () => {
      flipCard.classList.toggle('flipped');
    });

    // Keyboard accessibility
    flipCard.setAttribute('tabindex', '0');
    flipCard.setAttribute('role', 'button');
    flipCard.setAttribute('aria-label', 'Click to flip card and see contact details');
    flipCard.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        flipCard.classList.toggle('flipped');
      }
    });
  }

  /* ── 5. Smooth scroll for anchor links ─────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── 6. Animated stat counters ─────────────────────── */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (statNumbers.length) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => countObserver.observe(el));
  }

  function countUp(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ── 7. Catalogue filter (catalogue page) ──────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const catCards   = document.querySelectorAll('.cat-card');

  if (filterBtns.length && catCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        catCards.forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          card.style.transition = 'opacity 0.4s, transform 0.4s';
          if (show) {
            card.style.opacity = '1';
            card.style.transform = '';
            card.style.pointerEvents = '';
          } else {
            card.style.opacity = '0.25';
            card.style.transform = 'scale(0.97)';
            card.style.pointerEvents = 'none';
          }
        });
      });
    });
  }

  /* ── 8. Parallax blob drift on mousemove (hero) ────── */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    document.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth - 0.5) * 18;
      const y = (e.clientY / window.innerHeight - 0.5) * 18;
      const blobs = heroBg.querySelectorAll('.blob');
      blobs.forEach((blob, i) => {
        const depth = (i + 1) * 0.4;
        blob.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
      });
    });
  }

  /* ── 9. Subtle cursor trail on hero ────────────────── */
  // Lightweight — just a fading dot
  const hero = document.querySelector('.hero');
  if (hero && window.matchMedia('(pointer: fine)').matches) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:fixed; width:8px; height:8px; border-radius:50%;
      background:rgba(201,169,110,0.6); pointer-events:none;
      z-index:9999; transform:translate(-50%,-50%);
      transition:opacity 0.4s; opacity:0;
    `;
    document.body.appendChild(dot);

    let inHero = false;
    hero.addEventListener('mouseenter', () => { inHero = true; dot.style.opacity = '1'; });
    hero.addEventListener('mouseleave', () => { inHero = false; dot.style.opacity = '0'; });
    document.addEventListener('mousemove', e => {
      if (inHero) {
        dot.style.left = e.clientX + 'px';
        dot.style.top  = e.clientY + 'px';
      }
    });
  }

});
