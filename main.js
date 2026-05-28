// main.js — e27f0rx Portfolio

(function () {
  'use strict';

  /* ─── LOADER ─────────────────────────────── */
  const loader = document.getElementById('loader');
  const body = document.body;
  body.classList.add('loading');

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('done');
      body.classList.remove('loading');
      revealHero();
    }, 1800);
  });

  /* ─── CUSTOM CURSOR ──────────────────────── */
  const cursor = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursor-follower');
  let followerX = 0, followerY = 0;
  let cursorX = 0, cursorY = 0;

  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', e => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursor.style.left = cursorX + 'px';
      cursor.style.top  = cursorY + 'px';
    });

    (function followCursor() {
      followerX += (cursorX - followerX) * 0.12;
      followerY += (cursorY - followerY) * 0.12;
      cursorFollower.style.left = followerX + 'px';
      cursorFollower.style.top  = followerY + 'px';
      requestAnimationFrame(followCursor);
    })();

    document.querySelectorAll('a, button, [data-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => body.classList.remove('cursor-hover'));
    });
  }

  /* ─── NAVBAR ─────────────────────────────── */
  const navbar   = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
      body.style.overflow = '';
    });
  });

  /* ─── REVEAL ANIMATIONS ─────────────────── */
  function revealHero() {
    document.querySelectorAll('#hero .reveal-up').forEach(el => {
      el.classList.add('visible');
    });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal-up:not(#hero *), .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });

  /* ─── FOOTER YEAR ────────────────────────── */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─── WORKS SYSTEM ───────────────────────── */
  const STORAGE_KEY = 'e27f0rx_works';
  const worksGrid  = document.getElementById('worksGrid');
  const worksEmpty = document.getElementById('worksEmpty');
  let isAdmin = false;

  // Load works: merge localStorage edits over the static data
  function loadWorks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    // Fall back to static file data
    return Array.isArray(window.WORKS_DATA) ? [...window.WORKS_DATA] : [];
  }

  function saveWorks(works) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
  }

  // Extract embed URL from common video links
  function toEmbedUrl(url) {
    if (!url) return null;
    url = url.trim();

    // Already an embed
    if (url.includes('/embed/')) return url;

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;

    // Vimeo
    const vmMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}?dnt=1`;

    // TikTok
    const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
    if (ttMatch) return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;

    return url;
  }

  // Extract thumbnail URL for preview
  function getThumbnail(url) {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
    return null;
  }

  function renderWorks() {
    const works = loadWorks();
    worksGrid.innerHTML = '';

    if (!works.length) {
      worksEmpty.classList.remove('hidden');
      return;
    }
    worksEmpty.classList.add('hidden');

    works.forEach((work, i) => {
      const card = document.createElement('div');
      card.className = 'work-card';
      card.style.transitionDelay = `${i * 0.08}s`;

      const thumb = getThumbnail(work.url);
      const thumbHTML = thumb
        ? `<img src="${thumb}" alt="${escapeHtml(work.title)}" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.8"/>`
        : `<div class="work-thumb-placeholder"><svg width="56" height="56" viewBox="0 0 56 56" fill="none"><rect x="8" y="12" width="40" height="32" rx="3" stroke="white" stroke-width="1"/><path d="M22 21l14 7-14 7V21z" fill="white"/></svg></div>`;

      card.innerHTML = `
        <div class="work-thumb" style="position:relative;">
          ${thumbHTML}
          <div class="work-play">
            <div class="play-btn">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M6 4l9 5-9 5V4z" fill="${'#0B0F1E'}"/>
              </svg>
            </div>
          </div>
          ${isAdmin ? `<button class="work-card-delete" data-id="${work.id}" title="Delete">✕</button>` : ''}
        </div>
        <div class="work-info">
          <div class="work-meta">
            <span class="work-category">${escapeHtml(work.category || '')}</span>
            <span class="work-year">${escapeHtml(work.year || '')}</span>
          </div>
          <h3 class="work-title">${escapeHtml(work.title)}</h3>
          ${work.description ? `<p class="work-desc">${escapeHtml(work.description)}</p>` : ''}
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.work-card-delete')) return;
        openModal(work);
      });

      worksGrid.appendChild(card);

      // Staggered reveal via observer
      setTimeout(() => {
        const obs = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
        obs.observe(card);
      }, 0);
    });

    // Admin delete
    if (isAdmin) {
      worksGrid.querySelectorAll('.work-card-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const updated = loadWorks().filter(w => w.id !== id);
          saveWorks(updated);
          renderWorks();
        });
      });
    }
  }

  /* ─── VIDEO MODAL ────────────────────────── */
  const modal = document.getElementById('videoModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalVideoWrap = document.getElementById('modalVideoWrap');
  const modalTitle = document.getElementById('modalTitle');
  const modalCategory = document.getElementById('modalCategory');
  const modalDesc = document.getElementById('modalDesc');
  const modalYear = document.getElementById('modalYear');

  function openModal(work) {
    const embedUrl = toEmbedUrl(work.url);
    modalVideoWrap.innerHTML = embedUrl
      ? `<iframe src="${embedUrl}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
      : `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.3);font-size:0.85rem;">No video URL provided</div>`;

    modalTitle.textContent    = work.title || '';
    modalCategory.textContent = work.category || '';
    modalDesc.textContent     = work.description || '';
    modalYear.textContent     = work.year || '';

    modal.classList.remove('hidden');
    body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.add('hidden');
    modalVideoWrap.innerHTML = '';
    body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ─── ADMIN PANEL ────────────────────────── */
  const adminPanel   = document.getElementById('adminPanel');
  const addWorkBtn   = document.getElementById('addWorkBtn');
  const exportBtn    = document.getElementById('exportWorksBtn');
  const importBtn    = document.getElementById('importWorksBtn');
  const importFile   = document.getElementById('importFile');
  const addFirstWork = document.getElementById('addFirstWork');

  function checkAdminMode() {
    isAdmin = window.location.hash === '#admin';
    if (isAdmin) {
      adminPanel.classList.remove('hidden');
      worksGrid.classList.add('admin-mode');
    } else {
      adminPanel.classList.add('hidden');
      worksGrid.classList.remove('admin-mode');
    }
    renderWorks();
  }

  window.addEventListener('hashchange', checkAdminMode);

  if (addFirstWork) {
    addFirstWork.addEventListener('click', () => {
      window.location.hash = '#admin';
      document.getElementById('works').scrollIntoView({ behavior: 'smooth' });
    });
  }

  addWorkBtn && addWorkBtn.addEventListener('click', () => {
    const title    = document.getElementById('workTitle').value.trim();
    const category = document.getElementById('workCategory').value;
    const url      = document.getElementById('workUrl').value.trim();
    const desc     = document.getElementById('workDesc').value.trim();
    const year     = document.getElementById('workYear').value.trim();

    if (!title) { alert('Please enter a project title.'); return; }

    const works = loadWorks();
    works.push({
      id: 'w' + Date.now(),
      title, category, url, description: desc, year
    });
    saveWorks(works);

    // Clear form
    ['workTitle','workUrl','workDesc','workYear'].forEach(id => {
      document.getElementById(id).value = '';
    });

    renderWorks();
  });

  exportBtn && exportBtn.addEventListener('click', () => {
    const works = loadWorks();
    const blob = new Blob([JSON.stringify(works, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'works-data.json';
    a.click();
  });

  importBtn && importBtn.addEventListener('click', () => importFile.click());

  importFile && importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) {
          saveWorks(data);
          renderWorks();
          alert('Works imported successfully!');
        } else {
          alert('Invalid JSON format. Expected an array.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    importFile.value = '';
  });

  /* ─── CONTACT FORM ───────────────────────── */
  const contactForm = document.getElementById('contactForm');
  const submitBtn   = document.getElementById('submitBtn');
  const formStatus  = document.getElementById('formStatus');

  function showError(inputId, errorId, msg) {
    const el = document.getElementById(inputId);
    const err = document.getElementById(errorId);
    if (el) el.classList.add('error');
    if (err) err.textContent = msg;
    return false;
  }

  function clearErrors() {
    ['fullName','email','message'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('error');
    });
    ['nameError','emailError','messageError'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
  }

  contactForm && contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const name    = document.getElementById('fullName').value.trim();
    const email   = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    let valid = true;

    if (!name)                         { showError('fullName','nameError','Please enter your full name.'); valid = false; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                                       { showError('email','emailError','Please enter a valid email address.'); valid = false; }
    if (!message || message.length < 10) { showError('message','messageError','Message must be at least 10 characters.'); valid = false; }

    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Sending…';
    formStatus.textContent = '';
    formStatus.className = 'form-status';

    // Uses Formspree — free, no backend needed, works on GitHub Pages
    // Replace FORM_ID with your actual Formspree form ID (see README.md)
    const FORMSPREE_ID = 'YOUR_FORMSPREE_ID'; // ← replace this

    if (FORMSPREE_ID === 'YOUR_FORMSPREE_ID') {
      // Fallback: open mailto link
      const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      window.open(`mailto:robbcenan082708@gmail.com?subject=${subject}&body=${body}`, '_blank');
      formStatus.textContent = 'Your email client has been opened. Please send the pre-filled message.';
      formStatus.className = 'form-status success';
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = 'Send Message';
      return;
    }

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, message, _replyto: email })
      });

      if (res.ok) {
        formStatus.textContent = 'Message sent! I\'ll get back to you soon.';
        formStatus.className = 'form-status success';
        contactForm.reset();
      } else {
        throw new Error('Send failed');
      }
    } catch {
      formStatus.textContent = 'Something went wrong. Please try emailing directly.';
      formStatus.className = 'form-status error';
    }

    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').textContent = 'Send Message';
  });

  /* ─── UTILITY ────────────────────────────── */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ─── INIT ───────────────────────────────── */
  checkAdminMode();

})();
