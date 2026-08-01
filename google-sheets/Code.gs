// ============================================================
// Google Apps Script для приёма заявок с сайта в Google Таблицу
//
// ВАЖНО: если лист «Заявки» уже существовал со старыми колонками,
// скрипт при первом запуске заменит шапку на новую.
// ============================================================

var SHEET_NAME = "Заявки";

var HEADERS = [
  "Дата и время",
  "Имя",
  "Название организации",
  "Телефон",
  "Тип клиента",
  "Количество людей",
  "Комментарий"
];

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var d = JSON.parse(e.postData.contents);

    sheet.appendRow([
      d.date || new Date().toISOString(),
      d.name || "",
      d.orgName || "",
      d.phone || "",
      d.clientType === "organization" ? "Организация" : "Частное лицо",
      buildGuestsText(d),
      d.message || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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
        date: new Date().toISOString(),
        name: "Тест",
        orgName: "",
        phone: "+79990000000",
        clientType: "individual",
        guestsExact: "3",
        message: "Проверка связи"
      })
    }
  });
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    return sheet;
  }

  // Миграция: если шапка старая — обновляем (старые тестовые строки удаляются)
  var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (firstRow.join("|") !== HEADERS.join("|")) {
    sheet.clear();
    sheet.appendRow(HEADERS);
  }
  return sheet;
}
