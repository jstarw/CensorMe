var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;
var request = ('request');
var conceptExtractor = require('./utils/conceptExtractor');
var similarConcept = require('./utils/similarConcept')

app.use('/', express.static(__dirname+ '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/censor', function(req, res) {
    var url = req.query.url;
    var filter = JSON.parse(req.query.filter);
    conceptExtractor.extractConcept(url, filter, function(responseData){
        res.json({
            success: true,
            data: responseData
        });
    });
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

