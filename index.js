var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;
var request = require('request');
var similarConcept = require('./utils/similarConcept')
var conceptUtils = require('./utils/conceptUtils');
var extractor = require('unfluff');
var async = require('async');

app.use('/', express.static(__dirname+ '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

function sendErrorResponse(err, errCode, res) {
    return res.send(err);
}

function filterConcepts(extractRequest, filteredConcept, res, done) {
    var returnedConcepts;
    var resData;
    async.series([
        function(cb) {
            conceptUtils.extractConcept(extractRequest, function(err, concepts) {
                if (err) {
                    return cb(err);
                }
                if (!concepts) {
                    return cb("Resource Not Found");
                }
                if (!err) {
                    returnedConcepts = concepts
                    cb();
                }
            });
        },
        function(cb) {
            conceptUtils.filterConcepts(returnedConcepts, filteredConcept, function(err, responseData) {
                if (err) {
                    return cb(err);
                }
                resData = responseData;
                cb();
            });
        }
        ], function(err) {
            if (err) {
                return done(err);
            }
            done(null, resData);
        }
    );
}

app.get('/censor', function(req, res) {
    var url = req.query.url;
    console.log("this is url ", url);
    var filteredConcept = typeof(req.query.concepts) === 'string'? JSON.parse(req.query.concepts) : req.query.concepts;
    var extractRequest = {};
    async.series([
        function(cb) {
            if (url.indexOf("?") == -1) {
                extractRequest.url = url;
                cb();
            } else {
                request(url, function (error, response, body) {
                    if (error) {
                        return sendErrorResponse(err, 404, res);
                    }
                    extractRequest.text = body;
                    cb();
                });
            }
        },
        function(cb) {
            filterConcepts(extractRequest, filteredConcept, res, function(err, responseData) {
                if (err) {
                    return sendErrorResponse(err, 404, res);
                } else {
                    console.log(responseData);
                    res.json({
                        success: true,
                        conceptMatch: responseData
                    });
                }
            });
        }
    ], function(err) {
        if (err) {
            return sendErrorResponse(err, 404, res);
        }
    });
});

app.get('/concept', function(req, res){
    var user_concept = (req.query['concept']);
    similarConcept.getConcepts(user_concept, function(resp){
        res.json({
            success: true,
            results: resp
        });
    });
});

// app.get('/cortical', function(req, res){
//     request({
//         method: 'POST',
//         url: 'http://api.cortical.io/rest/compare/bulk',
//         headers: {
//             'api-key': '9f657440-3f3d-11e6-a057-97f4c970893c'
//         },
//         qs: {retina_name: 'en_associative'},
//         json:
//         [
//             [
//                 {
//                 "term" : "car"
//                 },
//                 {
//                 "term" : "cat"
//                 }
//             ],
//             [
//                 {
//                 "term" : "jaguar"
//                 },
//                 {
//                 "term" : "horse"
//                 }
//             ]
//         ]
//     }, function(error, response, body){
//         if(error) {
//             console.log(error);
//         } else {
//             console.log(response.statusCode, body);
//         }
//     });

// });

var server = app.listen(port, function(cb) {
    var port = server.address().port;
    console.log('Listening on port http://localhost:%s', port);
});

