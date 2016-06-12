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

        sendConcepts(conceptArray);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        concepts: "test",
        words: "test"
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

function delete_field(position) {
    $(position).last().remove();
}

function sendConcepts(concepts) {
    var GET_URL = "https://censor-me.herokuapp.com";
    $.ajax({
        url: GET_URL,
        data: {
            concepts: concepts[0]
        },
        success: recommend_similar_concepts
    }).fail(function() {
        alert("you suck!!!");
    });
}

function recommend_similar_concepts(res) {
    console.log(typeof(res));
    console.log(res);

    var temp = {
        "data": {
            "success": true,
            "top1": {
                "text": "s Pizza",
                "docs_with_phrase": 83,
                "occurrences": 386,
                "docs_with_all_terms": 163,
                "cluster": 1
            },
            "top2": {
                "text": "United States",
                "docs_with_phrase": 108,
                "occurrences": 267,
                "docs_with_all_terms": 118,
                "cluster": 0
            }
        }
    }

    if (!temp["data"]["success"]) {
        console.log("not successful")
    } else {
        
    }
}
