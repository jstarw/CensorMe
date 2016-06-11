var request = require('request');

var extractConcept = function (url, filter, cb) {
	console.log("Inside extract concept with : ", url, filter);
	cb();
}

module.exports = {
	extractConcept: extractConcept
};