var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;
var conceptExtractor = require('./utils/conceptExtractor')

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

var server = app.listen(port, function(cb) {
    var port = server.address().port;
    console.log('Listening on port http://localhost:%s', port);
});

