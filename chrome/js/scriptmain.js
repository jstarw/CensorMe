$(document).ready(function() {
    var url = window.location.href;
	chrome.storage.sync.get({
        concepts: "",
        words: ""
    }, function(items) {
        console.log("concept: ", items.concepts.length);
        console.log("words: ", items.words.length);
        filter_word(items.words);
        getHtmlContent();
        if (items.concepts.length > 0) send_data(url, items.concepts);

    });
});

function getHtmlContent() {
    var content = $('body').text().replace(/\r?\n|\r/g, "").trim().replace(/\t+/g, "");

    // console.log(content);
}

function send_data(websiteUrl, concepts) {
    var GET_URL = "https://censor-me.herokuapp.com/censor";
    $.get(
        GET_URL, 
        {
            url: websiteUrl,
            concepts: concepts //Array()
        }, filter_concept
    ).fail(function() {
        console.log("you suck!!!");
    });
}

function filter(res) {
    // var res = {
    //     success: true,
    //     conceptMatch: ["violence", "nudity"]
    // }
    console.log(res);
    if (res["success"] == true) {
        if (res["conceptMatch"].length > 0) {
            filter_concept(res["success"]["conceptMatch"]);
        }
    }
}

function filter_concept(res) {
    console.log(res);
    if (res["conceptMatch"].length == 0) return;

    var div = $("<div>", {class: "warning_concept"}).appendTo('body');
    var divCentered = $("<div>", {class: "warning_centered"}).appendTo(div)
    var description = $("<div>", {class: "warning_description"})
        .html("We have detected some content that might not be suitable for you. Would you still like to see it? ")
        .appendTo(divCentered);
    var okButton = $("<div>", {class: "warning_ok"}).html("That's okay, let me see it.").appendTo(divCentered);
    var closeButton = $("<div>", {class: "warning_close"}).html("Take me out of here.").appendTo(divCentered);
    console.log(okButton,closeButton);
    okButton.on('click', close_overlay);
    closeButton.on('click', go_back);
}

function filter_word(words) {
    for (i in words) {
        var regex = new RegExp(words[i], "g");
        var stars = words[i].replace(/./g, '*');
        console.log(regex);
        // recursive_replace('body', regex, stars);
        $("body").contents().each(function () {
            if (this.nodeType === 3) this.nodeValue = $.trim($(this).text()).replace(regex, stars)
            if (this.nodeType === 1) $(this).html( $(this).html().replace(regex, stars) ) // fix this
        })
    }
}

function recursive_replace(thisClass, regex, stars) {
    $(thisClass).contents().each(function () {
            if (this.nodeType === 3) this.nodeValue = $.trim($(this).text()).replace(regex, stars)
            if (this.nodeType === 1) $(this).html( recursive_replace(thisClass, regex) ) // fix this
        })
}

function close_overlay(e) {
    var targ = e.target;
    $(targ).parent().parent().hide();
}

function go_back(e) {
    window.history.back();
}