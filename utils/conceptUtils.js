havenondemand = require('havenondemand');
var client = new havenondemand.HODClient('8e9221a2-d004-44af-b172-c3897a6b0c1e');
var async = require('async');
var request = require('request');
var natural = require('natural');
var mapped_concepts = 'mapped_concepts';
var total_occurences = 'total_occurences';
var request = require('request');

var extractConcept = function (request, cb) {
    var extractedText;
    client.call('extractconcepts', request, function(conceptErr, responseConcept){
        if (conceptErr) {
            return errHandler(conceptErr, cb);
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
                return errHandler(err, cb);
            }
            else {
                // configs is now a map of JSON data
                mappedValues[mapped_concepts] = mappedConcepts;
                mappedValues[total_occurences] = totalOccurences;
                cb(null, mappedValues);
            }
        });
    });
}

var filterConcepts = function (mappedValues, filteredConcepts, cb) {
    var foundConcepts = [];
    if (mappedValues && mappedValues[mapped_concepts]) {
        var conceptKeys = Object.keys(mappedValues[mapped_concepts]);
    }
    var runningWeightedSum = 0;
    async.forEach(filteredConcepts, function(filteredConcept, filteredCallback) {
        async.forEach(conceptKeys, function(key, callback) {
            compareSematics(key, filteredConcept, function(matchingResponse) {
                if (isFinite(matchingResponse)) {
                    var percentMatched = (matchingResponse) * 100;
                    var weightedSum = percentMatched * mappedValues[mapped_concepts][key] / mappedValues[total_occurences];
                    runningWeightedSum += weightedSum;
                }
                callback();
            }, cb);
        }, function (err) {
            if (err) {
                return errHandler(err, cb);
            }
            if (runningWeightedSum > 5) {
                foundConcepts.push(filteredConcept);
            }
            runningWeightedSum = 0;
            filteredCallback();
        });
    }, function (err) {
            if (err) {
                return errHandler(err, cb);
            }
            cb(null, foundConcepts);
    });
}

function compareSematics (concept, filteredConcept, cb, done) { 
   //cb(natural.JaroWinklerDistance(concept, filteredConcept));
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
        if(error) {
            return errHandler(error, done)
        } else {
            if (response.statusCode === 200){
                return cb(parseFloat(body));
            } else {
                //if error the just pretend its 0
                return cb(0);
            }
        }
    });
}

function errHandler (err, cb) {
    // default to 404 if not specified
    var errCode = err.error || 404;
    var returnErr = {
        error: err,
        errCode: errCode
    }
    return cb(returnErr, null);
}

module.exports = {
    extractConcept: extractConcept,
    filterConcepts: filterConcepts
};