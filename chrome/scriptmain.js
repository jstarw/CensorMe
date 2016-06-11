$(document).ready(function() {
	console.log("is this working? ");
    var url = window.location.href;
	chrome.storage.sync.get({
        concepts: "test",
        words: "test"
    }, function(items) {
        console.log("concept: ", items.concepts);
        console.log("words: ", items.words);
        sendData(url, items.concepts, items.words)
    });
});

function sendData(websiteUrl, concepts, words) {
    var GET_URL = "https://censor-me.herokuapp.com/";
    $.ajax({
        url: GET_URL,
        data: {
            websiteUrl: websiteUrl,
            concepts: concepts,
            words: words
        },
        success: function(res) {console.log(res)}
    }).fail(function() {
        alert("you suck!!!");
    });
}