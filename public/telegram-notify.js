window.notifyTelegram = function (text) {
  var token = "8936900898:AAG4_jlATIsIPe4fbk8U5iOJAKK08hQtK_o";
  var chatId = "1315001188";
  fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: text }),
  }).catch(function () {});
};
