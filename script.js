/**
 * 萌宠洗护 — 手机端交互
 */
(function () {
  'use strict';

  var SCROLL_OFFSET = 96;

  var menuToggle = document.getElementById('menuToggle');
  var mobileNav = document.getElementById('mobileNav');
  var navOverlay = document.getElementById('navOverlay');
  var bookingForm = document.getElementById('bookingForm');
  var successModal = document.getElementById('successModal');
  var modalBackdrop = document.getElementById('modalBackdrop');
  var modalClose = document.getElementById('modalClose');
  var bookingDate = document.getElementById('bookingDate');

  function setMinBookingDate() {
    if (!bookingDate) return;
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    bookingDate.min = d.getFullYear() + '-' + m + '-' + day;
  }

  function initImages() {
    document.querySelectorAll('.media-img').forEach(function (img) {
      var frame = img.closest('.media-frame');

      function loaded() {
        img.classList.add('is-loaded');
        if (frame) frame.classList.remove('is-error');
      }

      function failed() {
        img.classList.remove('is-loaded');
        if (frame) frame.classList.add('is-error');
      }

      if (img.complete && img.naturalWidth > 0) {
        loaded();
      } else {
        img.addEventListener('load', loaded);
        img.addEventListener('error', failed);
      }
    });
  }

  function openMenu() {
    mobileNav.classList.add('is-open');
    navOverlay.classList.add('is-visible');
    mobileNav.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    mobileNav.classList.remove('is-open');
    navOverlay.classList.remove('is-visible');
    mobileNav.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      if (mobileNav.classList.contains('is-open')) closeMenu();
      else openMenu();
    });
  }

  if (navOverlay) navOverlay.addEventListener('click', closeMenu);

  if (mobileNav) {
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
  }

  function showModal() {
    successModal.hidden = false;
    document.body.style.overflow = 'hidden';
    if (modalClose) modalClose.focus();
  }

  function hideModal() {
    successModal.hidden = true;
    if (!mobileNav.classList.contains('is-open')) {
      document.body.style.overflow = '';
    }
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

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  setMinBookingDate();
  initImages();
})();
