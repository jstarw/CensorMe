var request = require('request');
havenondemand = require('havenondemand');
var client = new havenondemand.HODClient('8e9221a2-d004-44af-b172-c3897a6b0c1e');
var _ = require('lodash');

var getConcepts = function (user_concept, cb) {
    var data = {
        text: user_concept
    }
    client.call('findrelatedconcepts', data, function(err, resp, body){
        if (err) {
            errHandler(err, cb);
        }
        var results = resp.body.entities;
        /*console.log(results.sort(function(a, b){
            return parseFloat(a.occurrences) - parseFloat(b.occurrences);
        }));*/
        if(isNaN(user_concept) && user_concept && results && results.length != 0){
            results.sort(function(a, b){
                return parseFloat(a.occurrences) - parseFloat(b.occurrences);
            });
            var highest = results[results.length/2];
            var second_highest = results[results.length/2 + 1];
            cb({
                success: true,
                top1: highest, 
                top2: second_highest
            });
        }else{
            cb({
                success: false
            });
        }
    });
}

function errHandler (err, cb) {
    console.log("Error: ", err);
    cb(err);
}
module.exports = {
    getConcepts: getConcepts
};