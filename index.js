var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;
var request = ('request');
var similarConcept = require('./utils/similarConcept')
var conceptUtils = require('./utils/conceptUtils');

app.use('/', express.static(__dirname+ '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/censor', function(req, res) {
    console.log("I AM CALLED");
    var url = req.query.url;
    console.log("this is url ", url);
    var filteredConcept = typeof(req.query.concepts) === 'string'? JSON.parse(req.query.concepts) : req.query.concepts;
    if (filteredConcept) {
        conceptUtils.extractConcept(url, function(concepts) {
            conceptUtils.filterConcepts(concepts, filteredConcept, function(responseData) {
                res.json({
                    success: true,
                    conceptMatch: responseData
                });
            });
        });
    }
});

app.get('/concept', function(req, res){
    var user_concept = req.query['concept'];
    console.log(req.query['concept']);
    similarConcept.getConcepts(user_concept, function(resp){
        res.json({
            data: resp
        });
    });    
});

var server = app.listen(port, function(cb) {
    var port = server.address().port;
    console.log('Listening on port http://localhost:%s', port);
});

