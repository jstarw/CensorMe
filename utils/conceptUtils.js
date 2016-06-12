havenondemand = require('havenondemand');
var client = new havenondemand.HODClient('8e9221a2-d004-44af-b172-c3897a6b0c1e');
var async = require('async');

var extractConcept = function (request, cb) {

    var extractedText;
    client.call('extractconcepts', request, function(conceptErr, responseConcept){
        if (conceptErr) {
            errHandler(conceptErr, cb);
        }
        var concepts = responseConcept.body.concepts;
        var mappedConcepts = {};
        async.forEach(concepts, function(eachConcept){
            var key = eachConcept['concept'].toLowerCase();
            mappedConcepts[key] = eachConcept.occurrences;
        });
        cb(mappedConcepts);
    });
}

var filterConcepts = function (concepts, filteredConcepts, cb) {
    var foundConcepts = [];
    async.forEach(filteredConcepts, function(filteredConcept) {
        var filterBy = filteredConcept.toLowerCase();
        if (concepts[filterBy]) {
            foundConcepts.push(filteredConcept);
        }
    });
    cb(foundConcepts);
}

function errHandler (err, cb) {
    console.log("Error: ", err);
    cb(err);
}

module.exports = {
    extractConcept: extractConcept,
    filterConcepts: filterConcepts
};