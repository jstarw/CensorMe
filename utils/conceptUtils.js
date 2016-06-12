havenondemand = require('havenondemand');
var client = new havenondemand.HODClient('8e9221a2-d004-44af-b172-c3897a6b0c1e');
var async = require('async');
var request = require('request');
var natural = require('natural');
var mapped_concepts = 'mapped_concepts';
var total_occurences = 'total_occurences';

var extractConcept = function (request, cb) {

    var extractedText;
    client.call('extractconcepts', request, function(conceptErr, responseConcept){
        if (conceptErr) {
            errHandler(conceptErr, cb);
        }
        var concepts = responseConcept.body.concepts;
        var mappedValues = {};
        var mappedConcepts = {};
        var totalOccurences = 0;
        async.forEach(concepts, function(eachConcept, callback){
            if (eachConcept.occurrences > 5) {
                var key = eachConcept['concept'].toLowerCase();
                mappedConcepts[key] = eachConcept.occurrences;
                totalOccurences += eachConcept.occurrences;
            }
            callback();
        }, function (err) {
            if (err) {
                errHandler(err, cb);
            }
            // configs is now a map of JSON data
            mappedValues[mapped_concepts] = mappedConcepts;
            mappedValues[total_occurences] = totalOccurences;
            cb(mappedValues);
        });
    });
}

var filterConcepts = function (mappedValues, filteredConcepts, cb) {
    var foundConcepts = [];
    var conceptKeys = Object.keys(mappedValues[mapped_concepts]);
    var runningWeightedSum = 0;
    async.forEach(filteredConcepts, function(filteredConcept, filteredCallback) {
        async.forEach(conceptKeys, function(key, callback) {
            compareSematics(key, filteredConcept, function(matchingResponse) {
            var percentMatched = (matchingResponse) * 100;
            var weightedSum = percentMatched * mappedValues[mapped_concepts][key] / mappedValues[total_occurences];
            //console.log("weighted sum : " + weightedSum + " between: " + key + " & " + filteredConcept);
            // console.log("Total occurrences and current " , mappedValues[mapped_concepts][key] , mappedValues[][total_occurences]);
            runningWeightedSum += weightedSum;
            callback();
            });
        }, function (err) {
            if (err) {
                errHandler(err, cb);
            }
            console.log(filteredConcept + " has a weight score of : " + runningWeightedSum);
            if (runningWeightedSum > 5) {
                foundConcepts.push(filteredConcept);
            }
            runningWeightedSum = 0;
            filteredCallback();
        });
    }, function (err) {
            if (err) {
                errHandler(err, cb);
            }
            cb(foundConcepts);
    });
}

function compareSematics (concept, filteredConcept, cb) { 
   cb(natural.JaroWinklerDistance(concept, filteredConcept));
}

function errHandler (err, cb) {
    console.log("Error: ", err);
    cb(err);
}

module.exports = {
    extractConcept: extractConcept,
    filterConcepts: filterConcepts
};