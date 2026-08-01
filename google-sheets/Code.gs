// ============================================================
// Google Apps Script для приёма заявок с сайта в Google Таблицу
//
// КАК НАСТРОИТЬ (подробно: README.md в корне проекта):
//  1. Откройте вашу Google Таблицу
//  2. Расширения → Apps Script (Extensions → Apps Script)
//  3. Вставьте весь код этого файла вместо содержимого
//  4. Выберите функцию doPost (если выбрана не она) и нажмите «Развернуть»
//     → «Новое развертывание» → тип «Веб-приложение»
//  5. Выполнение: «От имени я», доступ: «Все, у кого есть ссылка»
//  6. Скопируйте URL веб-приложения и вставьте его в js/config.js → sheetsUrl
// ============================================================

var SHEET_NAME = "Заявки";

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.date || new Date().toISOString(),
      data.name || "",
      data.phone || "",
      data.clientType === "organization" ? "Организация" : "Частное лицо",
      data.message || ""
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

// Небольшая проверка, что скрипт работает (кнопка «Запуск» в редакторе)
function testPost() {
  doPost({
    postData: {
      contents: JSON.stringify({
        date: new Date().toISOString(),
        name: "Тест",
        phone: "+79990000000",
        clientType: "individual",
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
    sheet.appendRow(["Дата и время", "Имя", "Телефон", "Тип клиента", "Комментарий"]);
  }
  return sheet;
}
