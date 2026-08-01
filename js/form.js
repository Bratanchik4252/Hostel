(function () {
  "use strict";

  var CONFIG = window.SITE_CONFIG || {};
  var I18N = window.I18N || {};

  var form = document.getElementById("leadForm");
  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");

  var fName = document.getElementById("fName");
  var fOrgName = document.getElementById("fOrgName");
  var orgNameWrap = document.getElementById("orgNameWrap");
  var fPhone = document.getElementById("fPhone");
  var fMessage = document.getElementById("fMessage");
  var fGuestsExact = document.getElementById("fGuestsExact");
  var fGuestsFrom = document.getElementById("fGuestsFrom");
  var fGuestsTo = document.getElementById("fGuestsTo");
  var guestsRangeWrap = document.getElementById("guestsRangeWrap");

  if (!form || !statusEl) return;

  function t(key) {
    var lang = document.documentElement.getAttribute("lang") || "ru";
    var dict = I18N[lang] || I18N.ru;
    return dict[key] != null ? dict[key] : key;
  }

  function setStatus(message, type) {
    statusEl.textContent = message || "";
    statusEl.className = "form__status" + (type ? " is-" + type : "");
  }

  function isValidPhone(value) {
    var digits = (value || "").replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }

  // ===== Показ/скрытие «Названия организации» =====
  function onClientTypeChange() {
    var checked = document.querySelector('input[name="clientTypeRadio"]:checked');
    var isOrg = checked && checked.value === "organization";
    if (orgNameWrap) orgNameWrap.hidden = !isOrg;
    if (isOrg && fOrgName) fOrgName.setAttribute("required", "");
    else if (fOrgName) fOrgName.removeAttribute("required");
  }

  document.querySelectorAll('input[name="clientTypeRadio"]').forEach(function (radio) {
    radio.addEventListener("change", onClientTypeChange);
  });

  // ===== Переключение «точно» / «от ... до ...» =====
  function onGuestsModeChange() {
    var checked = document.querySelector('input[name="guestsMode"]:checked');
    var isRange = checked && checked.value === "range";
    if (fGuestsExact) fGuestsExact.hidden = isRange;
    if (guestsRangeWrap) guestsRangeWrap.hidden = !isRange;
  }

  document.querySelectorAll('input[name="guestsMode"]').forEach(function (radio) {
    radio.addEventListener("change", onGuestsModeChange);
  });

  function buildGuestsText() {
    var mode = document.querySelector('input[name="guestsMode"]:checked');
    if (mode && mode.value === "range") {
      var from = (fGuestsFrom && fGuestsFrom.value.trim()) || "";
      var to = (fGuestsTo && fGuestsTo.value.trim()) || "";
      if (from && to) return "от " + from + " до " + to;
      if (from) return "от " + from;
      if (to) return "до " + to;
      return "";
    }
    return (fGuestsExact && fGuestsExact.value.trim()) || "";
  }

  function isValidGuests() {
    var mode = document.querySelector('input[name="guestsMode"]:checked');
    if (mode && mode.value === "range") {
      var from = parseInt(fGuestsFrom.value, 10);
      var to = parseInt(fGuestsTo.value, 10);
      if (isNaN(from) && isNaN(to)) return false;
      if (!isNaN(from) && from < 1) return false;
      if (!isNaN(to) && to < 1) return false;
      if (!isNaN(from) && !isNaN(to) && from > to) return false;
      return true;
    }
    var exact = parseInt(fGuestsExact.value, 10);
    return !isNaN(exact) && exact >= 1;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus(t("formSending"), "");

    if (!isValidPhone(fPhone.value)) {
      setStatus(t("formPhoneError"), "error");
      fPhone.focus();
      return;
    }

    var isOrg = (function () {
      var checked = document.querySelector('input[name="clientTypeRadio"]:checked');
      return checked && checked.value === "organization";
    })();

    if (isOrg && (!fOrgName || !fOrgName.value.trim())) {
      setStatus(t("formOrgNameError"), "error");
      if (fOrgName) fOrgName.focus();
      return;
    }

    if (!isValidGuests()) {
      setStatus(t("formGuestsError"), "error");
      return;
    }

    var url = CONFIG.sheetsUrl;
    if (!url) {
      setStatus(t("formConfigError"), "error");
      return;
    }

    var payload = {
      date: new Date().toISOString(),
      name: fName ? fName.value.trim() : "",
      orgName: isOrg && fOrgName ? fOrgName.value.trim() : "",
      phone: fPhone.value.trim(),
      clientType: isOrg ? "organization" : "individual",
      guestsExact: (fGuestsExact ? fGuestsExact.value.trim() : "") || "",
      guestsFrom: (fGuestsFrom ? fGuestsFrom.value.trim() : "") || "",
      guestsTo: (fGuestsTo ? fGuestsTo.value.trim() : "") || "",
      message: fMessage ? fMessage.value.trim() : ""
    };

    submitBtn.disabled = true;

    fetch(url, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function () {
        setStatus(t("formSuccess"), "success");
        form.reset();
        onClientTypeChange();
        onGuestsModeChange();
      })
      .catch(function () {
        setStatus(t("formError"), "error");
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });

  onClientTypeChange();
  onGuestsModeChange();
})();
