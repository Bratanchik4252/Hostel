(function () {
  "use strict";

  var CONFIG = window.SITE_CONFIG || {};

  // Тарифы будут добавлены после согласования цен с владельцами хостела.
  // Формат: { bunk: { individual: 0, organization: 0 }, private: { individual: 0, organization: 0 } }
  var RATES = CONFIG.calcRates || {};

  var tabs = document.querySelectorAll(".calc__tab");
  var roomEl = document.getElementById("calcRoom");
  var guestsEl = document.getElementById("calcGuests");
  var nightsEl = document.getElementById("calcNights");
  var priceEl = document.getElementById("calcPrice");
  var clientTypeInput = document.getElementById("clientType");

  var currentType = "individual";

  function setType(type) {
    currentType = type === "organization" ? "organization" : "individual";
    tabs.forEach(function (tab) {
      tab.classList.toggle("is-active", tab.getAttribute("data-calc-tab") === currentType);
    });
    if (clientTypeInput) clientTypeInput.value = currentType;
    document.querySelectorAll('input[name="clientTypeRadio"]').forEach(function (radio) {
      if (radio.value === currentType) radio.checked = true;
    });
    updatePrice();
  }

  function updatePrice() {
    if (!priceEl) return;
    var room = roomEl ? roomEl.value : "bunk";
    var guests = parseInt(guestsEl ? guestsEl.value : 1, 10) || 1;
    var nights = parseInt(nightsEl ? nightsEl.value : 1, 10) || 1;

    var rate = RATES[room] && RATES[room][currentType];
    if (!rate) {
      priceEl.textContent = "\u2014 \u20BD";
      return;
    }
    var total = rate * guests * nights;
    priceEl.textContent = total.toLocaleString("ru-RU") + " \u20BD";
  }

  // Кнопки-переключатели калькулятора
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      setType(tab.getAttribute("data-calc-tab"));
    });
  });

  // Кнопки «Частным лицам» / «Организациям» на главном экране
  document.querySelectorAll("[data-calc-type]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setType(btn.getAttribute("data-calc-type"));
    });
  });

  // Переключение типа в форме синхронизирует калькулятор
  document.querySelectorAll('input[name="clientTypeRadio"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      if (radio.checked) setType(radio.value);
    });
  });

  [roomEl, guestsEl, nightsEl].forEach(function (el) {
    if (el) el.addEventListener("input", updatePrice);
  });

  // ===== ПАМЯТКА: чтобы включить калькулятор =====
  // 1. Заполните объект RATES выше реальными тарифами.
  // 2. В index.html снимите блюр: замените класс у блока .calc__blur на скрытый
  //    (например, добавьте style="display:none") и уберите aria-hidden у .calc__panel.
  // 3. Табличка с текстом «Цены уточняются» исчезнет сама вместе с блюром.

  setType("individual");
})();
