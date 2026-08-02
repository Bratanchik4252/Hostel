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

    var url = CONFIG.sheetsUrl;
    if (!url) {
      setStatus(t("formConfigError"), "error");
      return;
    }

    var payload = {
      date: new Date().toISOString(),
      name: fName ? fName.value.trim() : "",
      orgName: type === "organization" && fOrgName ? fOrgName.value.trim() : "",
      phone: fPhone.value.trim(),
      clientType: type,
      dateIn: fDateIn ? fDateIn.value : "",
      guestsExact: fGuestsExact ? fGuestsExact.value.trim() : "",
      guestsFrom: fGuestsFrom ? fGuestsFrom.value.trim() : "",
      guestsTo: fGuestsTo ? fGuestsTo.value.trim() : "",
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
      .then(function (data) {
        if (data && data.ok === false) throw new Error(data.error || "server error");
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
