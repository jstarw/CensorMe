var request = require('request');
havenondemand = require('havenondemand');
var client = new havenondemand.HODClient('8e9221a2-d004-44af-b172-c3897a6b0c1e');
var _ = require('lodash');
var async = require('async');

var getConcepts = function (user_concept, cb) {
    var results = new Array();
    console.log(typeof user_concept);
    if(typeof user_concept != "object"){
        apiCall(user_concept, function(res){
            console.log("here");
            results = results.concat(res);
            cb(results);
        });
    }else{
        async.forEach(user_concept, function(eachconcept, callback){
            apiCall(eachconcept, function(res){
                console.log(res);
                results = results.concat(res);
                callback();
            });
        }, function(){
            cb(results);
        });
    }
}

var apiCall = function (data, cb){
    var data = {
            text: data
        }
        client.call('findrelatedconcepts', data, function(err, resp, body){
            if (err) {
                errHandler(err, cb);
            }
            var results = resp.body.entities;
            /*console.log(results.sort(function(a, b){
                return parseFloat(a.occurrences) - parseFloat(b.occurrences);
            }));*/
            if(isNaN(data) && data && results && results.length != 0){
                results.sort(function(a, b){
                    return parseFloat(a.occurrences) - parseFloat(b.occurrences);
                });
                var highest = results[results.length/2];
                var second_highest = results[results.length/2 + 1];
                var results = [highest, second_highest];
                cb(results);
            }else{
                errHandler("No Results", cb);
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