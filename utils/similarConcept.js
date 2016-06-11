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
        console.log(results);
        if(isNaN(user_concept) && user_concept && results && results.length != 0){
            var highest={occurrences: 1}, second_highest={occurrences: 0};
            for(var i = 0; i < results.length; i++){
                if((second_highest.occurrences < results[i].occurrences) && 
                    !(results[i].text.toLowerCase() === user_concept.toLowerCase())){
                    second_highest = results[i];
                    if(second_highest.occurrences > highest.occurrences){
                        var holder = highest;
                        highest = second_highest;
                        second_highest = holder;
                    }
                }
            }
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