(function () {
  "use strict";

  var CONFIG = window.SITE_CONFIG || {};
  var I18N = window.I18N || {};

  var LS_LANG = "site_lang";
  var LS_THEME = "site_theme";

  var lang = localStorage.getItem(LS_LANG) || CONFIG.defaultLang || "ru";
  var theme = localStorage.getItem(LS_THEME) || CONFIG.defaultTheme || "light";
  if (!I18N[lang]) lang = "ru";

  var header = document.getElementById("header");
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  var settingsBtn = document.getElementById("settingsBtn");
  var settingsPanel = document.getElementById("settingsPanel");
  var privacyLink = document.getElementById("privacyLink");
  var privacyModal = document.getElementById("privacyModal");

  // ===== ТЕМА =====
  function applyTheme(value) {
    document.documentElement.setAttribute("data-theme", value);
    localStorage.setItem(LS_THEME, value);
    document.querySelectorAll(".chip[data-theme]").forEach(function (chip) {
      chip.classList.toggle("is-active", chip.getAttribute("data-theme") === value);
    });
  }

  // ===== ЯЗЫК =====
  function applyLang(value) {
    var t = I18N[value] || I18N.ru;
    document.documentElement.setAttribute("lang", value);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (t[key] != null) el.textContent = t[key];
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (t[key] != null) el.innerHTML = t[key];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-ph");
      if (t[key] != null) el.setAttribute("placeholder", t[key]);
    });

    document.querySelectorAll(".chip[data-lang]").forEach(function (chip) {
      chip.classList.toggle("is-active", chip.getAttribute("data-lang") === value);
    });

    var copy = document.getElementById("footerCopy");
    if (copy && t.footerCopy) {
      var year = new Date().getFullYear();
      copy.textContent = t.footerCopy
        .replace("{year}", year)
        .replace("{site}", t.siteName);
    }

    localStorage.setItem(LS_LANG, value);
  }

  // ===== ШАПКА: тень при прокрутке + подсветка пунктов =====
  var sections = document.querySelectorAll("section[id]");
  var navLinks = document.querySelectorAll(".nav__link");

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 10);

    var pos = window.scrollY + 100;
    var currentId = "";
    sections.forEach(function (sec) {
      if (pos >= sec.offsetTop) currentId = sec.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + currentId);
    });
  }

  // ===== ЗАКРЫТИЕ МЕНЮ/ПАНЕЛИ =====
  function closeAll() {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    settingsPanel.hidden = true;
    settingsBtn.classList.remove("is-spinning");
  }

  // ===== СОБЫТИЯ =====
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    settingsPanel.hidden = true;
  });

  settingsBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    var isOpen = settingsPanel.hidden;
    settingsPanel.hidden = !isOpen;
    settingsBtn.classList.toggle("is-spinning", isOpen);
  });

  document.addEventListener("click", function (e) {
    if (!settingsPanel.hidden &&
        !settingsPanel.contains(e.target) &&
        !settingsBtn.contains(e.target)) {
      closeAll();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll();
  });

  document.querySelectorAll(".chip[data-lang]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      lang = chip.getAttribute("data-lang");
      applyLang(lang);
    });
  });

  document.querySelectorAll(".chip[data-theme]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      theme = chip.getAttribute("data-theme");
      applyTheme(theme);
    });
  });

  // Плавная прокрутка + закрытие мобильного меню
  document.querySelectorAll("a[data-scroll]").forEach(function (link) {
    link.addEventListener("click", function () {
      closeAll();
    });
  });

  // Модалка политики
  privacyLink.addEventListener("click", function (e) {
    e.preventDefault();
    privacyModal.hidden = false;
    document.body.style.overflow = "hidden";
  });

  document.querySelectorAll("[data-close-modal]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      privacyModal.hidden = true;
      document.body.style.overflow = "";
    });
  });

  // ===== ИНИЦИАЛИЗАЦИЯ =====
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  applyTheme(theme);
  applyLang(lang);
})();
