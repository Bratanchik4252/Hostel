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

  // ===== СЛАЙДЕР-ПЕРЕКЛЮЧАТЕЛЬ =====
  function initSlider(el, onChange) {
    if (!el) return null;
    var indicator = el.querySelector(".slider__indicator");
    var options = Array.prototype.slice.call(el.querySelectorAll(".slider__option"));
    var count = options.length || 1;
    el.style.setProperty("--slider-count", count);

    function move(activeEl) {
      var idx = options.indexOf(activeEl);
      if (idx < 0) idx = 0;
      options.forEach(function (o) { o.classList.toggle("is-active", o === activeEl); });
      if (indicator) indicator.style.transform = "translateX(" + idx * 100 + "%)";
    }

    options.forEach(function (opt) {
      opt.addEventListener("click", function () {
        move(opt);
        if (onChange) onChange(opt.getAttribute("data-slider-value"));
      });
    });

    var init = el.querySelector(".slider__option.is-active") || options[0];
    if (init) move(init);

    return {
      move: move,
      get: function () {
        var a = el.querySelector(".slider__option.is-active");
        return a ? a.getAttribute("data-slider-value") : null;
      }
    };
  }

  // ===== СОСТОЯНИЕ ТИПА КЛИЕНТА =====
  window.clientType = "individual";
  window.guestsMode = "exact";

  function setClientType(type) {
    type = type === "organization" ? "organization" : "individual";
    window.clientType = type;

    var priv = document.getElementById("audPrivate");
    var org = document.getElementById("audOrg");
    if (priv) priv.hidden = type !== "individual";
    if (org) org.hidden = type !== "organization";

    var aud = window.audSlider;
    if (aud) {
      var a = document.querySelector('#audSlider .slider__option[data-slider-value="' + type + '"]');
      if (a) aud.move(a);
    }
    var cs = window.calcSlider;
    if (cs) {
      var c = document.querySelector('#calcSlider .slider__option[data-slider-value="' + type + '"]');
      if (c) cs.move(c);
    }
    var fs = window.clientSlider;
    if (fs) {
      var f = document.querySelector('#clientSlider .slider__option[data-slider-value="' + type + '"]');
      if (f) fs.move(f);
    }

    var wrap = document.getElementById("orgNameWrap");
    if (wrap) wrap.hidden = type !== "organization";

    var h = document.getElementById("clientType");
    if (h) h.value = type;

    if (window.calc && window.calc.update) window.calc.update(type);
  }
  window.setClientType = setClientType;

  function setGuestsMode(mode) {
    window.guestsMode = mode === "range" ? "range" : "exact";
    var exact = document.getElementById("fGuestsExact");
    var wrap = document.getElementById("guestsRangeWrap");
    if (exact) exact.hidden = mode === "range";
    if (wrap) wrap.hidden = mode !== "range";
  }
  window.setGuestsMode = setGuestsMode;

  window.audSlider = initSlider(document.getElementById("audSlider"), setClientType);
  window.calcSlider = initSlider(document.getElementById("calcSlider"), setClientType);
  window.clientSlider = initSlider(document.getElementById("clientSlider"), setClientType);
  window.guestsSlider = initSlider(document.getElementById("guestsSlider"), setGuestsMode);

  // Кнопки «Частным лицам» / «Организациям» (главный экран и секции)
  document.querySelectorAll("[data-audience]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setClientType(btn.getAttribute("data-audience"));
    });
  });

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
  setClientType("individual");
})();
