(function () {
  "use strict";

  var CONFIG = window.SITE_CONFIG || {};
  var I18N = window.I18N || {};

  var form = document.getElementById("leadForm");
  var submitBtn = document.getElementById("submitBtn");
  var statusEl = document.getElementById("formStatus");

  if (!form || !statusEl) return;

  function t(key) {
    var lang = document.documentElement.getAttribute("lang") || "ru";
    var dict = I18N[lang] || I18N.ru;
    return dict[key] != null ? dict[key] : key;
  }

  function isValidPhone(value) {
    var digits = (value || "").replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }

  function setStatus(message, type) {
    statusEl.textContent = message || "";
    statusEl.className = "form__status" + (type ? " is-" + type : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus(t("formSending"), "");

    var phone = document.getElementById("fPhone");
    var name = document.getElementById("fName");
    var message = document.getElementById("fMessage");
    var clientType = document.querySelector('input[name="clientTypeRadio"]:checked');

    if (!isValidPhone(phone.value)) {
      setStatus(t("formPhoneError"), "error");
      phone.focus();
      return;
    }

    var url = CONFIG.sheetsUrl;
    if (!url) {
      setStatus(t("formConfigError"), "error");
      return;
    }

    var payload = {
      date: new Date().toISOString(),
      name: (name && name.value) ? name.value : "",
      phone: phone.value,
      clientType: clientType ? clientType.value : "individual",
      message: (message && message.value) ? message.value : ""
    };

    submitBtn.disabled = true;

    // Content-Type: text/plain — чтобы не было CORS preflight,
    // Google Apps Script сам разберёт JSON из e.postData.contents
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
      })
      .catch(function () {
        setStatus(t("formError"), "error");
      })
      .finally(function () {
        submitBtn.disabled = false;
      });
  });
})();
