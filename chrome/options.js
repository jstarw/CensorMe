$(document).ready(function() {
    restore_options();
    $('#save').on('click', save_options);
    $('#add_concept').on('click', function() {add_new_fields('input_concept', [''], '.concept_div')});
    $('#add_word').on('click', function() {add_new_fields('input_word', [''], '.word_div')});
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
        $('#status').html("value saved.");
        setTimeout(function() {
            $('#status').html("");
        }, 750);
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
        add_new_fields("input_concept", items.concepts, '.concept_div');
        add_new_fields("input_word", items.words, '.word_div');

        console.log("concept: ", items.concepts);
        console.log("words: ", items.words);
    });
}

function add_new_fields(thisClass, thisValue, position) {
    for (key in thisValue) {
        $('<input>').attr({
            type: 'text',
            class: thisClass,
            name: thisClass,
            value: thisValue[key]
        }).appendTo(position);
    }   
}

function delete_field(position) {
    $(position).last().remove();
}
