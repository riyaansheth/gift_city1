/* ══ gallery.js — Lightbox + Category tabs ════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Category Tab Switching ─────────────────────── */
  const tabs     = document.querySelectorAll('.cat-tab');
  const sections = document.querySelectorAll('.cat-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;

      // Update tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update sections
      sections.forEach(s => {
        s.classList.remove('active');
        if (s.id === target) s.classList.add('active');
      });

      // Scroll to section top (accounting for sticky nav + tab bar)
      window.scrollTo({ top: document.querySelector('.cat-tab-bar').offsetTop - 70, behavior: 'smooth' });
    });
  });

  /* ── 2. Count loaded photos per category ───────────── */
  function updateCounts() {
    ['statues','fountains','idols','murals','vases'].forEach(cat => {
      const grid  = document.getElementById(cat + '-grid');
      const badge = document.getElementById(cat + '-count');
      if (!grid || !badge) return;

      const cards = grid.querySelectorAll('.photo-card:not(.img-missing)');
      let loaded = 0;
      const all = grid.querySelectorAll('.photo-card');

      // Count cards that successfully loaded an image
      all.forEach(card => {
        const img = card.querySelector('img');
        if (img && img.complete && img.naturalWidth > 0) loaded++;
      });

      badge.textContent = loaded > 0 ? `${loaded} pieces` : `${all.length} slots`;
    });
  }

  // Update counts once images have had a chance to load
  setTimeout(updateCounts, 800);
  window.addEventListener('load', updateCounts);

  /* ── 3. Lightbox ────────────────────────────────────── */
  const lightbox     = document.getElementById('lightbox');
  const lbImg        = document.getElementById('lightbox-img');
  const lbTitle      = document.getElementById('lightbox-title');
  const lbDesc       = document.getElementById('lightbox-desc');
  const lbCounter    = document.getElementById('lightbox-counter');
  const lbThumbs     = document.getElementById('lightbox-thumbs');
  const lbSpinner    = document.getElementById('lightbox-spinner');
  const lbClose      = document.getElementById('lightbox-close');
  const lbPrev       = document.getElementById('lightbox-prev');
  const lbNext       = document.getElementById('lightbox-next');
  const lbBackdrop   = document.getElementById('lightbox-backdrop');

  let currentCategory = null;
  let currentIndex    = 0;
  let categoryImages  = [];   // array of { src, title, desc, thumbSrc }

  // Build image list from a category grid (only successfully loaded images)
  function buildImageList(categoryId) {
    const grid = document.getElementById(categoryId + '-grid');
    if (!grid) return [];
    const list = [];
    grid.querySelectorAll('.photo-card:not(.img-missing)').forEach((card, i) => {
      const img = card.querySelector('img');
      if (!img) return;
      list.push({
        src:   img.src,
        title: img.dataset.title || img.alt || 'Photo ' + (i + 1),
        desc:  img.dataset.desc  || '',
        index: i
      });
    });
    return list;
  }

  // Open lightbox
  function openLightbox(categoryId, clickedCard) {
    currentCategory = categoryId;
    categoryImages  = buildImageList(categoryId);

    if (categoryImages.length === 0) return;

    // Find the clicked index
    const img = clickedCard.querySelector('img');
    const clickedSrc = img ? img.src : '';
    currentIndex = categoryImages.findIndex(item => item.src === clickedSrc);
    if (currentIndex < 0) currentIndex = 0;

    buildThumbs();
    showImage(currentIndex);

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    currentCategory = null;
    categoryImages  = [];
    lbImg.src = '';
    lbThumbs.innerHTML = '';
  }

  // Show image at index
  function showImage(index) {
    if (index < 0) index = categoryImages.length - 1;
    if (index >= categoryImages.length) index = 0;
    currentIndex = index;

    const item = categoryImages[index];

    // Start loading
    lbImg.classList.add('loading');
    lbSpinner.classList.add('active');

    const tempImg = new Image();
    tempImg.onload = () => {
      lbImg.src = item.src;
      lbImg.alt = item.title;
      lbImg.classList.remove('loading');
      lbSpinner.classList.remove('active');
    };
    tempImg.onerror = () => {
      lbImg.classList.remove('loading');
      lbSpinner.classList.remove('active');
    };
    tempImg.src = item.src;

    lbTitle.textContent   = item.title;
    lbDesc.textContent    = item.desc;
    lbCounter.textContent = `${index + 1} / ${categoryImages.length}`;

    // Update thumb highlight
    lbThumbs.querySelectorAll('.lb-thumb').forEach((th, i) => {
      th.classList.toggle('active', i === index);
    });

    // Scroll active thumb into view
    const activeTh = lbThumbs.querySelector('.lb-thumb.active');
    if (activeTh) activeTh.scrollIntoView({ inline: 'nearest', behavior: 'smooth' });

    // Prev / next visibility
    lbPrev.style.opacity = categoryImages.length <= 1 ? '0.2' : '1';
    lbNext.style.opacity = categoryImages.length <= 1 ? '0.2' : '1';
    lbPrev.disabled = categoryImages.length <= 1;
    lbNext.disabled = categoryImages.length <= 1;
  }

  // Build thumbnail strip
  function buildThumbs() {
    lbThumbs.innerHTML = '';
    categoryImages.forEach((item, i) => {
      const th = document.createElement('div');
      th.className = 'lb-thumb' + (i === currentIndex ? ' active' : '');
      th.innerHTML = `<img src="${item.src}" alt="${item.title}" loading="lazy" />`;
      th.addEventListener('click', () => showImage(i));
      lbThumbs.appendChild(th);
    });
  }

  /* ── 4. Attach click handlers to photo cards ─────── */
  function attachCardClicks() {
    document.querySelectorAll('.photo-card').forEach(card => {
      if (card.classList.contains('img-missing')) return;
      card.addEventListener('click', () => {
        const section = card.closest('.cat-section');
        if (!section) return;
        openLightbox(section.id, card);
      });
    });
  }

  // Attach immediately and also after a delay for any late-loaded state
  attachCardClicks();

  // Also mark missing images and re-attach on img error
  document.querySelectorAll('.photo-card img').forEach(img => {
    img.addEventListener('error', () => {
      img.closest('.photo-card').classList.add('img-missing');
    });
    img.addEventListener('load', () => {
      img.closest('.photo-card').classList.remove('img-missing');
    });
  });

  /* ── 5. Lightbox controls ───────────────────────────── */
  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex - 1); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentIndex + 1); });

  /* ── 6. Keyboard navigation ─────────────────────────── */
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showImage(currentIndex - 1);
    if (e.key === 'ArrowRight')  showImage(currentIndex + 1);
  });

  /* ── 7. Touch swipe on lightbox ─────────────────────── */
  let touchStartX = 0;
  const lbContainer = document.querySelector('.lightbox-container');

  if (lbContainer) {
    lbContainer.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lbContainer.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 50) {
        dx < 0 ? showImage(currentIndex + 1) : showImage(currentIndex - 1);
      }
    }, { passive: true });
  }

  /* ── 8. Nav scroll effect (catalogue page) ──────────── */
  const nav = document.getElementById('navbar');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  /* ── 9. Mobile nav toggle ───────────────────────────── */
  const toggle   = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── 10. Scroll reveal ──────────────────────────────── */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(el => obs.observe(el));
  }

});
