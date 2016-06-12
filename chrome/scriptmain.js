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

    // console.log(content);
}

function send_data(websiteUrl, concepts, words) {
    var GET_URL = "https://censor-me.herokuapp.com/censor";
    $.get(
        GET_URL, 
        {
            url: websiteUrl,
            concepts: concepts, //Array()
            words: words //Array()
        }, filter_concept
    ).fail(function() {
        console.log("you suck!!!");
        filter_concept(1);
    });
}

function filter_concept(res) {
    console.log(res);
    var res = {
        success: true,
        conceptMatch: ["violence", "nudity"],
        wordMatch: {
            "Linux": "sentenceContext"
        }
    }

    if (res["conceptMatch"].length == 0) {
        console.log('good page!');
        return;
    }
    var div = $("<div>", {class: "warning_concept"}).appendTo('body');
    var description = $("<div>", {class: "warning_description"})
        .html("We have detected some content that might not be suitable for you. Would you still like to see it? ")
        .appendTo(div);
    var okButton = $("<div>", {class: "warning_ok"}).html("That's okay, let me see it.").appendTo(div);
    var closeButton = $("<div>", {class: "warning_close"}).html("Take me out of here.").appendTo(div);
    console.log(okButton,closeButton);
    okButton.on('click', close_overlay);
    closeButton.on('click', go_back);
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

function close_overlay(e) {
    var targ = e.target;
    $(targ).parent().hide();
}

function go_back(e) {
    window.history.back();
}