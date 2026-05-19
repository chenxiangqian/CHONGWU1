/**
 * 萌宠洗护 — 多页面站点
 */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* —— 页面进入/退出 —— */
  document.body.classList.add('page-enter');

  document.querySelectorAll('a[href]').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('tel:') === 0 || href.indexOf('mailto:') === 0) return;
    if (link.target === '_blank') return;
    if (href.indexOf('http') === 0 && href.indexOf(location.origin) !== 0) return;

    link.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var url = link.href;
      if (!url || url === location.href) return;
      e.preventDefault();
      if (prefersReduced) {
        location.href = url;
        return;
      }
      document.body.classList.remove('page-enter');
      document.body.classList.add('page-exit');
      setTimeout(function () {
        location.href = url;
      }, 220);
    });
  });

  /* —— 导航菜单 —— */
  var menuToggle = document.getElementById('menuToggle');
  var mobileNav = document.getElementById('mobileNav');
  var navOverlay = document.getElementById('navOverlay');

  function closeMenu() {
    if (!mobileNav) return;
    mobileNav.classList.remove('is-open');
    if (navOverlay) navOverlay.classList.remove('is-visible');
    mobileNav.setAttribute('aria-hidden', 'true');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function openMenu() {
    mobileNav.classList.add('is-open');
    if (navOverlay) navOverlay.classList.add('is-visible');
    mobileNav.setAttribute('aria-hidden', 'false');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      if (mobileNav.classList.contains('is-open')) closeMenu();
      else openMenu();
    });
  }
  if (navOverlay) navOverlay.addEventListener('click', closeMenu);
  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
  }

  /* —— 图片加载 —— */
  function initImages() {
    document.querySelectorAll('.media-img, .hero-poster-fallback').forEach(function (img) {
      var frame = img.closest('.media-frame');
      function ok() {
        img.classList.add('is-loaded');
        if (frame) frame.classList.remove('is-error');
      }
      function fail() {
        if (frame) frame.classList.add('is-error');
      }
      if (img.complete && img.naturalWidth > 0) ok();
      else {
        img.addEventListener('load', ok);
        img.addEventListener('error', fail);
      }
    });
  }

  /* —— Hero 视频 fallback —— */
  var heroVideo = document.querySelector('.hero-video');
  var heroMedia = document.querySelector('.hero-media');
  if (heroVideo && heroMedia) {
    heroVideo.addEventListener('error', function () {
      heroMedia.classList.add('is-video-failed');
    });
    heroVideo.addEventListener('loadeddata', function () {
      heroMedia.classList.remove('is-video-failed');
    });
    setTimeout(function () {
      if (heroVideo.readyState < 2) heroMedia.classList.add('is-video-failed');
    }, 2500);
  }

  /* —— 轮播 —— */
  function initCarousel(root) {
    if (!root) return;

    var track = root.querySelector('.carousel-track');
    var slides = root.querySelectorAll('.carousel-slide');
    var dotsWrap = root.querySelector('.carousel-dots');
    var prevBtn = root.querySelector('.carousel-btn--prev');
    var nextBtn = root.querySelector('.carousel-btn--next');
    var count = slides.length;
    var index = 0;
    var autoplayMs = parseInt(root.getAttribute('data-autoplay') || '5000', 10);
    var timer = null;
    var startX = 0;
    var deltaX = 0;

    if (!track || count === 0) return;

    function goTo(i) {
      index = (i + count) % count;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.carousel-dot').forEach(function (dot, di) {
          dot.classList.toggle('is-active', di === index);
          dot.setAttribute('aria-selected', di === index ? 'true' : 'false');
        });
      }
    }

    if (dotsWrap && count > 1) {
      dotsWrap.innerHTML = '';
      for (var d = 0; d < count; d++) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot' + (d === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', '第 ' + (d + 1) + ' 项');
        dot.setAttribute('aria-selected', d === 0 ? 'true' : 'false');
        (function (di) {
          dot.addEventListener('click', function () {
            goTo(di);
            resetAutoplay();
          });
        })(d);
        dotsWrap.appendChild(dot);
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goTo(index - 1);
        resetAutoplay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goTo(index + 1);
        resetAutoplay();
      });
    }

    var viewport = root.querySelector('.carousel-viewport');
    if (viewport && count > 1) {
      viewport.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        deltaX = 0;
        stopAutoplay();
      }, { passive: true });
      viewport.addEventListener('touchmove', function (e) {
        deltaX = e.touches[0].clientX - startX;
      }, { passive: true });
      viewport.addEventListener('touchend', function () {
        if (Math.abs(deltaX) > 50) {
          goTo(index + (deltaX < 0 ? 1 : -1));
        }
        resetAutoplay();
      });
    }

    function stopAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    function resetAutoplay() {
      stopAutoplay();
      if (count > 1 && autoplayMs > 0 && !prefersReduced) {
        timer = setInterval(function () {
          goTo(index + 1);
        }, autoplayMs);
      }
    }

    goTo(0);
    resetAutoplay();
  }

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);

  /* —— 滚动出现 —— */
  if (!prefersReduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* —— 预约表单 —— */
  var bookingForm = document.getElementById('bookingForm');
  var bookingDate = document.getElementById('bookingDate');
  var successModal = document.getElementById('successModal');
  var modalBackdrop = document.getElementById('modalBackdrop');
  var modalClose = document.getElementById('modalClose');

  function setMinBookingDate() {
    if (!bookingDate) return;
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    bookingDate.min = d.getFullYear() + '-' + m + '-' + day;
  }

  function showModal() {
    if (!successModal) return;
    successModal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (modalClose) modalClose.focus();
  }

  function hideModal() {
    if (!successModal) return;
    successModal.hidden = true;
    document.body.style.overflow = '';
  }

  if (modalClose) modalClose.addEventListener('click', hideModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', hideModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && successModal && !successModal.hidden) hideModal();
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var petType = document.getElementById('petType');
      var serviceType = document.getElementById('serviceType');
      var phone = document.getElementById('phone');
      if (!petType.value || !serviceType.value || !bookingDate.value) {
        alert('请填写完整预约信息');
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(phone.value.trim())) {
        alert('请输入正确的手机号码');
        phone.focus();
        return;
      }
      showModal();
      bookingForm.reset();
      setMinBookingDate();
    });
  }

  setMinBookingDate();
  initImages();
})();
