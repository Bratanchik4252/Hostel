(function () {
  "use strict";

  // Койко-место: 500 ₽/сутки для частных лиц, 400 ₽/сутки для организаций.
  // Для организаций добавляется НДС 5%.
  var RATES = { bunk: { individual: 500, organization: 400 } };
  var VAT = 0.05;

  var currentType = window.clientType === "organization" ? "organization" : "individual";

  var dateEl = null;
  var guestsEl = document.getElementById("calcGuests");
  var nightsEl = document.getElementById("calcNights");
  var priceEl = document.getElementById("calcPrice");
  var rateLineEl = document.getElementById("calcRateLine");
  var vatNoteEl = document.getElementById("calcVatNote");

  function t(key) {
    var lang = document.documentElement.getAttribute("lang") || "ru";
    var dict = (window.I18N || {})[lang] || {};
    return dict[key] != null ? dict[key] : key;
  }

  function fmt(n) {
    return n.toLocaleString("ru-RU");
  }

  function updatePrice() {
    if (!priceEl) return;
    var guests = parseInt(guestsEl.value, 10) || 1;
    var nights = parseInt(nightsEl.value, 10) || 1;

    var rate = RATES.bunk[currentType] || 0;
    var base = rate * guests * nights;
    var total = currentType === "organization" ? Math.round(base * (1 + VAT)) : base;

    if (rateLineEl) rateLineEl.textContent = fmt(rate) + " \u20BD / \u0441\u0443\u0442\u043a\u0438";
    if (vatNoteEl) {
      var isOrg = currentType === "organization";
      vatNoteEl.textContent = isOrg ? t("calcVatNote") : "";
      vatNoteEl.style.display = isOrg ? "" : "none";
    }
    priceEl.textContent = fmt(total) + " \u20BD";
  }

  [dateEl, guestsEl, nightsEl].forEach(function (el) {
    if (el) el.addEventListener("input", updatePrice);
  });

  window.calc = {
    update: function (type) {
      currentType = type === "organization" ? "organization" : "individual";
      updatePrice();
    }
  };

  updatePrice();
})();
