$(document).ready(function() {
    var url = window.location.href;
	chrome.storage.sync.get({
        concepts: "test",
        words: "test"
    }, function(items) {
        console.log("concept: ", items.concepts);
        console.log("words: ", items.words);
        filter_word(items.words);
        getHtmlContent();
        send_data(url, items.concepts, items.words)
    });
});

function getHtmlContent() {
    var content = $('body').text().replace(/\r?\n|\r/g, "").trim().replace(/\t+/g, "");

    console.log(content);
}

function send_data(websiteUrl, concepts, words) {
    var GET_URL = "https://censor-me.herokuapp.com/censor";
    $.get(
        GET_URL, 
        {
            url: websiteUrl,
            concepts: concepts, //Array()
            words: words //Array()
        }, filter
    ).fail(function() {
        console.log("you suck!!!");
    });
}

function filter(res) {
    console.log(res);
    var res = {
        success: true,
        conceptMatch: ["violence", "nudity"],
        wordMatch: {
            "Linux": "sentenceContext"
        }
    }
}

function filter_word(words) {
    for (i in words) {
        var regex = new RegExp(words[i], "g");
        var stars = words[i].replace(/./g, '*');
        console.log(regex);
        $("body").contents().each(function () {
            if (this.nodeType === 3) this.nodeValue = $.trim($(this).text()).replace(regex, stars)
            if (this.nodeType === 1) $(this).html( $(this).html().replace(regex, stars) ) // fix this
        })
    }
}