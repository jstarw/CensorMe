havenondemand = require('havenondemand');
var client = new havenondemand.HODClient('8e9221a2-d004-44af-b172-c3897a6b0c1e');
var async = require('async');
var request = require('request');
var natural = require('natural');
var mapped_concepts = 'mapped_concepts';
var total_occurences = 'total_occurences';
var request = require('request');
var _ = require('lodash');

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
    var totalConcepts = conceptKeys.length;
    var runningWeightedSum = 0;
    async.forEach(filteredConcepts, function(filteredConcept, filteredCallback) {
        compareConcepts(filteredConcept, conceptKeys, compareSematicsCortical, function(err, similarityMap) {
            if (err) {
                return cb(err);
            }
            console.log(filteredConcept + ' : ');
            checkIfSimilar(similarityMap, totalConcepts, function(isFound) {
                if (isFound) {
                    foundConcepts.push(filteredConcept);
                }
                filteredCallback();
            });
        });
    }, function (err) {
        if (err) {
            return errHandler(err, cb);
        }
        cb(null, foundConcepts);
    });
}

// Function is used to calculate if filtered concept is found on page
function checkIfSimilar (similarityMap, totalConcept, cb) {
    var runningPercentage = 0;
    async.forEach(similarityMap, function(similarityKey, callback) {
        runningPercentage += similarityKey.simPercentage*100;
        callback();
    }, function () {
            var truePercentage = runningPercentage/totalConcept;
            console.log(truePercentage);
            if (truePercentage > 10) {
                cb(true);
            } else {
                cb(false);
            }
    });
}

function compareConcepts (filteredConcept, conceptKeys, compareSematicsCorticalCb, done) {
    var conceptArray = [];
    // Create the concept array first so cortical API can compare
    async.forEach(conceptKeys, function(key, callback) {
        conceptArray.push([
            {
                term: key
            },
            {
                term: filteredConcept
            }
        ]);
        callback();
    }, function (err) {
        if (err) {
            return errHandler(err, cb);
        }
        compareSematicsCorticalCb (conceptArray, function(similarityMap) {
            done (null, similarityMap);
        }, done);
    });
}

// API is used for a semantic comparison of the found and filtered concepts
function compareSematicsCortical (conceptArray, cb, done) {
    request({
        method: 'POST',
        url: 'http://api.cortical.io/rest/compare/bulk',
        headers: {
            'api-key': '9f657440-3f3d-11e6-a057-97f4c970893c'
        },
        qs: {retina_name: 'en_associative'},
        json: conceptArray
    }, function(error, response, body){
        if(error) {
            console.log('Cortical API has encountered error');
            return done(error);
        } else {
            if (response.statusCode !== 200) {
                done('Error in comparison with cortical');
            }
            var similarityMap = _.map(body, function (data) {
                if (data.overlappingLeftRight !== 0 ||
                    data.overlappingRightLeft !== 0) {
                    return {
                        simPercentage: Math.max(data.overlappingLeftRight, data.overlappingRightLeft)
                    };
                }
            });
            // Get rid of junk data
            var filteredSimilarityMap = _.filter(similarityMap, function(similarityItem) {return !_.isNil(similarityItem)});
            cb(filteredSimilarityMap);
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