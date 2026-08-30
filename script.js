/* ==========================================================
   RIDWAN MAULANA — PORTOFOLIO
   script.js — tema iOS glass, tanpa library eksternal
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========================================================
     1. NAVBAR (Dynamic Island): efek saat scroll + progress bar
     ======================================================== */
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');

  function onScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    navbar.classList.toggle('is-scrolled', scrollY > 20);

    backToTop.style.opacity = scrollY > 400 ? '1' : '0';
    backToTop.style.pointerEvents = scrollY > 400 ? 'auto' : 'none';

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  backToTop.style.transition = 'opacity .3s ease';
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ========================================================
     2. MOBILE SHEET (gaya iOS action sheet)
     ======================================================== */
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileScrim = document.getElementById('mobileScrim');

  function closeMobileMenu() {
    burgerBtn.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    mobileScrim.classList.remove('is-open');
    burgerBtn.setAttribute('aria-expanded', 'false');
  }
  function openMobileMenu() {
    burgerBtn.classList.add('is-open');
    mobileMenu.classList.add('is-open');
    mobileScrim.classList.add('is-open');
    burgerBtn.setAttribute('aria-expanded', 'true');
  }

  burgerBtn.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('is-open');
    isOpen ? closeMobileMenu() : openMobileMenu();
  });
  mobileScrim.addEventListener('click', closeMobileMenu);

  mobileMenu.querySelectorAll('[data-nav-mobile]').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ========================================================
     3. HIGHLIGHT TAB NAVBAR SESUAI SECTION AKTIF
     ======================================================== */
  const sections = document.querySelectorAll('main section[id]');
  const navTabs = document.querySelectorAll('.island-nav__tab[data-nav]');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navTabs.forEach(tab => {
          tab.classList.toggle('is-active', tab.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(section => navObserver.observe(section));

  /* ========================================================
     4. SCROLL REVEAL — muncul dengan efek spring
     ======================================================== */
  const revealEls = document.querySelectorAll('.reveal');

  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ========================================================
     5. ACTIVITY RINGS ala Apple Watch (isi ring + angka %)
     ======================================================== */
  const ringProgressEls = document.querySelectorAll('.ring-progress[data-percent]');

  const ringObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const circle = entry.target;
      const target = parseInt(circle.dataset.percent, 10) || 0;
      const radius = circle.r.baseVal.value;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (target / 100) * circumference;

      circle.style.strokeDasharray = `${circumference}`;
      // beri jeda kecil supaya transisi CSS ikut terpicu
      requestAnimationFrame(() => {
        circle.style.strokeDashoffset = prefersReducedMotion ? offset : `${offset}`;
      });

      const percentLabel = circle.closest('.ring-card, .widget__ring-mini')?.querySelector('.ring-card__percent');
      if (percentLabel) animateCounter(percentLabel, target);

      obs.unobserve(circle);
    });
  }, { threshold: 0.5 });

  ringProgressEls.forEach(circle => ringObserver.observe(circle));

  function animateCounter(el, target) {
    if (prefersReducedMotion) {
      el.textContent = target + '%';
      return;
    }
    let current = 0;
    const duration = 1000;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.round(current) + '%';
    }, stepTime);
  }

  /* ========================================================
     6. TILT 3D UNTUK KARTU PROYEK (ala App Store)
     ======================================================== */
  if (!prefersReducedMotion) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateX = ((y / rect.height) - 0.5) * -10;
        const rotateY = ((x / rect.width) - 0.5) * 10;

        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        card.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--my', `${(y / rect.height) * 100}%`);
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  /* ========================================================
     7. PARALLAX RINGAN UNTUK WIDGET STACK DI HERO
     ======================================================== */
  const widgetStack = document.getElementById('widgetStack');
  if (widgetStack && !prefersReducedMotion && window.matchMedia('(min-width: 1025px)').matches) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      widgetStack.style.transform = `rotateX(${y * -6}deg) rotateY(${x * 6}deg)`;
    });
  }

  /* ========================================================
     8. EFEK MENGETIK DI WIDGET PROFIL
     ======================================================== */
  const typedLine = document.getElementById('typedLine');
  const textToType = 'console.log("Terima kasih sudah mampir!");';

  function typeWriter() {
    if (!typedLine) return;

    if (prefersReducedMotion) {
      typedLine.textContent = textToType;
      return;
    }

    let i = 0;
    const speed = 42;

    function tick() {
      if (i <= textToType.length) {
        typedLine.textContent = textToType.slice(0, i);
        i++;
        setTimeout(tick, speed);
      }
    }
    tick();
  }
  setTimeout(typeWriter, 700);

  /* ========================================================
     9. IOS BANNER (notifikasi mengambang di atas)
     ======================================================== */
  const iosBanner = document.getElementById('iosBanner');
  const iosBannerTitle = document.getElementById('iosBannerTitle');
  const iosBannerBody = document.getElementById('iosBannerBody');
  let bannerTimer;

  function showIosBanner(title, body, duration = 2600) {
    iosBannerTitle.textContent = title;
    iosBannerBody.textContent = body;
    iosBanner.classList.add('is-visible');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => iosBanner.classList.remove('is-visible'), duration);
  }

  /* ========================================================
     10. FORM KONTAK — validasi lalu arahkan langsung ke WhatsApp
     ------------------------------------------------------
     CATATAN UNTUK RIDWAN:
     Nomor WhatsApp tujuan diambil dari variabel WA_NUMBER di bawah.
     Ganti nilainya kapan pun nomormu berubah.
     ======================================================== */
  const WA_NUMBER = '6283112071814';
  const contactForm = document.getElementById('contactForm');

  function setFieldError(field, message) {
    const group = field.closest('.form-group');
    const errorEl = group.querySelector('.form-error');
    if (message) {
      group.classList.add('has-error');
      errorEl.textContent = message;
    } else {
      group.classList.remove('has-error');
      errorEl.textContent = '';
    }
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nama = document.getElementById('nama');
    const email = document.getElementById('email');
    const pesan = document.getElementById('pesan');

    let valid = true;

    if (nama.value.trim().length < 2) {
      setFieldError(nama, 'Nama minimal 2 karakter ya.');
      valid = false;
    } else {
      setFieldError(nama, '');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      setFieldError(email, 'Masukkan format email yang benar.');
      valid = false;
    } else {
      setFieldError(email, '');
    }

    if (pesan.value.trim().length < 5) {
      setFieldError(pesan, 'Pesan terlalu pendek.');
      valid = false;
    } else {
      setFieldError(pesan, '');
    }

    if (!valid) return;

    const waText =
      `Halo Ridwan, perkenalkan saya ${nama.value.trim()} (${email.value.trim()}).\n\n${pesan.value.trim()}`;
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`;

    showIosBanner('Membuka WhatsApp…', 'Pesanmu sudah disiapkan.');
    contactForm.reset();

    setTimeout(() => {
      window.open(waUrl, '_blank', 'noopener');
    }, 500);
  });

});
