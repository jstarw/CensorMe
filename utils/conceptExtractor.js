var request = require('request');
havenondemand = require('havenondemand');
var client = new havenondemand.HODClient('8e9221a2-d004-44af-b172-c3897a6b0c1e');
var _ = require('lodash');

var extractConcept = function (url, filter, cb) {
    var request = {
        url: url
    }
    var extractedText ;
    //extract text from url
    client.call('extracttext', request, function(extractErr, responseText){
        if (extractErr) {
            errHandler(extractErr, cb);
        }
        extractedText = responseText.body.document[0].content;
        var conceptRequest = {
            text: extractedText
        };
        client.call('extractconcepts', conceptRequest, function(conceptErr, responseConcept){
            if (conceptErr) {
                errHandler(conceptErr, cb);
            }
            var concepts = responseConcept.body.concepts;
            _.map(concepts, function(concept){
                var key = concept[concept];
                return {
                    key: concept.occurences
                }
            });
            cb(concepts);
        });
    });
}

function errHandler (err, cb) {
    console.log("Error: ", err);
    cb(err);
}
module.exports = {
    extractConcept: extractConcept
};