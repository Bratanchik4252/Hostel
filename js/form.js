(function () {
  "use strict";

  var CONFIG = window.SITE_CONFIG || {};
  var I18N = window.I18N || {};

  var form = document.getElementById("leadForm");
  var statusEl = document.getElementById("formStatus");
  var submitBtn = document.getElementById("submitBtn");

  var fName = document.getElementById("fName");
  var fOrgName = document.getElementById("fOrgName");
  var fPhone = document.getElementById("fPhone");
  var fDateIn = document.getElementById("fDateIn");
  var fMessage = document.getElementById("fMessage");
  var fGuestsExact = document.getElementById("fGuestsExact");
  var fGuestsFrom = document.getElementById("fGuestsFrom");
  var fGuestsTo = document.getElementById("fGuestsTo");

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

  function isValidGuests() {
    var mode = window.guestsMode || "exact";
    if (mode === "range") {
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

    var type = window.clientType === "organization" ? "organization" : "individual";

    if (!isValidPhone(fPhone.value)) {
      setStatus(t("formPhoneError"), "error");
      fPhone.focus();
      return;
    }

    if (type === "organization" && (!fOrgName || !fOrgName.value.trim())) {
      setStatus(t("formOrgNameError"), "error");
      fOrgName.focus();
      return;
    }

    if (!isValidGuests()) {
      setStatus(t("formGuestsError"), "error");
      return;
    }

    var key = CONFIG.web3Key;
    if (!key) {
      setStatus(t("formConfigError"), "error");
      return;
    }

    var guests;
    var mode = window.guestsMode || "exact";
    if (mode === "range") {
      var from = fGuestsFrom ? fGuestsFrom.value.trim() : "";
      var to = fGuestsTo ? fGuestsTo.value.trim() : "";
      guests = (from ? "от " + from : "") + (from && to ? " " : "") + (to ? "до " + to : "");
    } else {
      guests = fGuestsExact ? fGuestsExact.value.trim() : "";
    }

    var name = fName ? fName.value.trim() : "";

    var payload = {
      access_key: key,
      subject: "Заявка с сайта — Центр размещения (Хостел 33): " + (name || "без имени") + ", тел. " + fPhone.value.trim(),
      from_name: "Центр размещения (Хостел 33)",
      botcheck: "",
      name: name,
      phone: fPhone.value.trim(),
      clientType: type,
      orgName: type === "organization" && fOrgName ? fOrgName.value.trim() : "",
      dateIn: fDateIn ? fDateIn.value : "",
      guests: guests,
      message: fMessage ? fMessage.value.trim() : ""
    };

    submitBtn.disabled = true;

    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!data || data.success !== true) {
          throw new Error((data && data.message) || "server error");
        }
        setStatus(t("formSuccess"), "success");
        form.reset();
        if (window.setClientType) window.setClientType("individual");
        if (window.setGuestsMode) window.setGuestsMode("exact");
      })
      .catch(function (err) {
        var msg = err && err.message;
        setStatus((msg && msg.indexOf("HTTP") !== 0) ? msg : t("formError"), "error");
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
})();
