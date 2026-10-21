
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('StudySpace');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}
