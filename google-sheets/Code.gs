// ============================================================
// Google Apps Script для приёма заявок с сайта в Google Таблицу
//
// ВАЖНО: после замены кода обязательно переразверните скрипт:
// «Развернуть» → «Управлять развертываниями» → карандаш ✎ →
// «Версия: Новая версия» → «Развернуть».
// ============================================================

var SHEET_NAME = "Заявки";

// Email, на который приходит полный текст заявки (и в почту, и в таблицу)
var NOTIFY_EMAIL = "danielganbarov6@gmail.com";

var HEADERS = [
  "Дата и время",
  "Имя",
  "Название организации",
  "Телефон",
  "Тип клиента",
  "Дата заезда",
  "Количество людей",
  "Комментарий"
];

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var d = JSON.parse(e.postData.contents);

    var row = [
      formatDate(d.date),
      d.name || "",
      d.orgName || "",
      d.phone || "",
      d.clientType === "organization" ? "Организация" : "Частное лицо",
      d.dateIn || "",
      buildGuestsText(d),
      d.message || ""
    ];

    // Пишем ровно следующей строкой после последней заполненной
    var nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

    // Полный текст заявки дублируем на почту
    sendOrderEmail(d);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Отправляет на почту полный текст заявки
function sendOrderEmail(d) {
  if (!NOTIFY_EMAIL) return;
  var clientType = d.clientType === "organization" ? "Организация" : "Частное лицо";
  var body = [
    "Новая заявка с сайта — Центр размещения (Хостел 33):",
    "",
    "Имя: " + (d.name || "—"),
    "Телефон: " + (d.phone || "—"),
    "Тип клиента: " + clientType,
    "Название организации: " + (d.orgName || "—"),
    "Дата заезда: " + (d.dateIn || "—"),
    "Количество людей: " + buildGuestsText(d),
    "Комментарий: " + (d.message || "—"),
    "Дата и время отправки: " + formatDate(d.date)
  ].join("\n");

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: "Заявка с сайта: " + (d.name || "без имени") + ", тел. " + (d.phone || "—"),
    body: body
  });
}

// Приводит ISO-дату к читаемому виду: 2026-08-01 20:37
function formatDate(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  function p(n) { return (n < 10 ? "0" : "") + n; }
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) +
    " " + p(d.getHours()) + ":" + p(d.getMinutes());
}

function buildGuestsText(d) {
  var from = d.guestsFrom || "";
  var to = d.guestsTo || "";
  if (from && to) return "от " + from + " до " + to;
  if (from) return "от " + from;
  if (to) return "до " + to;
  return d.guestsExact || "";
}

// Проверка без сайта (кнопка «Запуск» в редакторе)
function testPost() {
  doPost({
    postData: {
      contents: JSON.stringify({
        date: "2026-08-01T20:37:44.922Z",
        name: "Тест",
        orgName: "ООО «Тест»",
        phone: "+79990000000",
        clientType: "organization",
        dateIn: "2026-08-15",
        guestsFrom: "10",
        guestsTo: "15",
        message: "Проверка связи"
      })
    }
  });
}

// Полная очистка таблицы и восстановление шапки.
// Запустите ОДИН раз из редактора Apps Script (выберите эту функцию и нажмите «Запуск»),
// если в таблице накопился мусор после ручного стирания ячеек.
function resetSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Шапка всегда ровно в первой строке
  var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (firstRow.join("|") !== HEADERS.join("|")) {
    sheet.clear();
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }

  return sheet;
}
