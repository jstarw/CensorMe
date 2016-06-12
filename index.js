var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;
var conceptUtils = require('./utils/conceptUtils');

app.use('/', express.static(__dirname+ '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/censor', function(req, res) {
    var url = req.query.url;
    var filteredConcept = JSON.parse(req.query.concepts);
    if (filteredConcept) {
        conceptUtils.extractConcept(url, function(concepts) {
            conceptUtils.filterConcepts(concepts, filteredConcept, function(responseData) {
                res.json({
                    success: true,
                    data: responseData
                });
            });
        });
    }
});

var server = app.listen(port, function(cb) {
    var port = server.address().port;
    console.log('Listening on port http://localhost:%s', port);
});

