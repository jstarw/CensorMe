$(document).ready(function() {
    restore_options();
    $('#save').on('click', save_options);
    $('#add_concept').on('click', function() {add_new_fields('input_concept', [''], '.concept_div', 'type the concept here:')});
    $('#add_word').on('click', function() {add_new_fields('input_word', [''], '.word_div', 'type the word here:')});
    $('#delete_concept').on('click', function() {delete_field('.input_concept')});
    $('#delete_word').on('click', function() {delete_field('.input_word')});
});

// Saves options to chrome.storage
function save_options() {
    var conceptArray = $('.input_concept').map(function(i, elem) {
        return $(elem).val();
    }).get();
    var wordArray = $('.input_word').map(function(i, elem) {
        return $(elem).val();
    }).get();
    console.log(conceptArray, wordArray);

    chrome.storage.sync.set({
        concepts: conceptArray,
        words: wordArray
        }, function() {
        // Update status to let user know options were saved.
        $('#status').show();
        setTimeout(function() {
            $('#status').hide();
        }, 1000);

        $('.recommendations li').remove();
        sendConcepts(conceptArray);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        concepts: "",
        words: ""
    }, function(items) {
        add_new_fields("input_concept", items.concepts, '.concept_div', 'type the concept here:');
        add_new_fields("input_word", items.words, '.word_div', 'type the word here:');

        console.log("concept: ", items.concepts);
        console.log("words: ", items.words);
    });
}

function add_new_fields(thisClass, thisValue, position, placeholder) {
    for (key in thisValue) {
        $('<input>').attr({
            type: 'text',
            class: thisClass + " form-control",
            name: thisClass,
            value: thisValue[key],
            placeholder: placeholder
        }).appendTo(position);
    }   
}

function add_new_recommendation(thisClass, thisValue, position) {
    for (key in thisValue) {
        var list = $('<li>').appendTo(position);
        $('<a>').attr({
            href: "#",
            class: thisClass
        }).html(thisValue[key]).appendTo(list);
    }
}

function delete_field(position) {
    $(position).last().remove();
}

function sendConcepts(concepts) {
    var GET_URL = "https://censor-me.herokuapp.com/concept";
    $.get(GET_URL,{concept: concepts}, recommend_similar_concepts)
    .fail(function() {
        alert("you suck!!!");
    });
}

function recommend_similar_concepts(res) {
    console.log(res);
    // var res = {
    //     data: {
    //         success: true,
    //         results: ["violence", "badboi", "sweet man"]
    //     }
    // }

    if (!res["data"]["success"]) {
        console.log("not successful");
        return;
    } 
    var concepts = res["data"]["results"].map(function(elem) {
        return elem;//["text"];
    });
    console.log(concepts);
    $('.recommendations').show();
    add_new_recommendation("recommend_concept", concepts, '.recommendations');

    $('.recommend_concept').on('click', function() {
        var c = $(this).html();
        add_new_fields('input_concept', [c], '.concept_div', 'type the concept here:');
        this.remove();
    });
}
