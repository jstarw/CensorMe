$(document).ready(function() {
    var url = window.location.href;
	chrome.storage.sync.get({
        concepts: "test",
        words: "test"
    }, function(items) {
        console.log("concept: ", items.concepts);
        console.log("words: ", items.words);
        filter_word(["Linux"]);
        //send_data(url, items.concepts, items.words)
    });
});

function send_data(websiteUrl, concepts, words) {
    var GET_URL = "https://censor-me.herokuapp.com/";
    $.ajax({
        url: GET_URL,
        data: {
            url: websiteUrl,
            concepts: concepts, //Array()
            words: words //Array()
        },
        success: filter
    }).fail(function() {
        alert("you suck!!!");
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
        $("body").contents().each(function () {
            if (this.nodeType === 3) this.nodeValue = $.trim($(this).text()).replace(regex, "[EXPLICIT]")
            if (this.nodeType === 1) $(this).html( $(this).html().replace(regex, "[EXPLICIT]") )
        })
    }
}