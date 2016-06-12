havenondemand = require('havenondemand');
var client = new havenondemand.HODClient('8e9221a2-d004-44af-b172-c3897a6b0c1e');
var async = require('async');
var request = require('request');
var natural = require('natural');
var total_occurences = 'total_occurences';

var extractConcept = function (request, cb) {

    var extractedText;
    client.call('extractconcepts', request, function(conceptErr, responseConcept){
        if (conceptErr) {
            errHandler(conceptErr, cb);
        }
        var concepts = responseConcept.body.concepts;
        var mappedConcepts = {};
        var totalOccurences = 0;
        async.forEach(concepts, function(eachConcept, callback){
            if (eachConcept.occurrences > 2) {
                var key = eachConcept['concept'].toLowerCase();
                mappedConcepts[key] = eachConcept.occurrences;
                totalOccurences += eachConcept.occurrences;
            }
            callback();
        }, function (err) {
            if (err) console.error(err.message);
            // configs is now a map of JSON data
            mappedConcepts[total_occurences] = totalOccurences;
            cb(mappedConcepts);
        });
    });
}

var filterConcepts = function (concepts, filteredConcepts, cb) {
    var foundConcepts = [];
    var conceptKeys = Object.keys(concepts);
    var runningWeightedSum = 0;
    async.forEach(filteredConcepts, function(filteredConcept, filteredCallback) {
        async.forEach(conceptKeys, function(key, callback) {
            compareSematics(key, filteredConcept, function(matchingResponse) {
            var percentMatched = parseFloat(matchingResponse) * 100;
                if(isFinite(percentMatched)) {
                    //infinity is treated as 0 in our case
                    var weightedSum = percentMatched * concepts[key] / concepts[total_occurences];
                    // console.log("weighted sum : " , weightedSum);
                    // console.log("Total occurrences and current " , concepts[key] , concepts[total_occurences]);
                    runningWeightedSum += weightedSum;
                }
            callback();
            });
        }, function (err) {
            if (err) console.error(err.message);
            console.log(filteredConcept + " has a weight score of : " + runningWeightedSum);
            if (runningWeightedSum > 5) {
                console.log("just casue he got heart dont mean he got heart");
                foundConcepts.push(filteredConcept);
            }
            runningWeightedSum = 0;
            filteredCallback();
        });
    }, function (err) {
            if (err) console.error(err.message);
            cb(foundConcepts);
    });
}

function compareSematics (concept, filteredConcept, cb) {
    var swoogleUrl = "http://swoogle.umbc.edu/SimService/GetSimilarity";
    request({
        url: swoogleUrl, //URL to hit
        qs: {
            operation: 'api',
            phrase1: concept,
            phrase2: filteredConcept, 
            type: 'relation', 
            corpus: 'webbase'
        }, //Query string data
        method: 'GET', //Specify the method
    }, function(error, response, body){
        //console.log("Compared " + concept + " to " + filteredConcept);
        if(error) {
            console.log(error);
        } else {
            if (response.statusCode === 200){
                cb(body);
            } else {
                //if error the just pretend its 0
                cb('0');
            }
        }
    });
}

function errHandler (err, cb) {
    console.log("Error: ", err);
    cb(err);
}

module.exports = {
    extractConcept: extractConcept,
    filterConcepts: filterConcepts
};