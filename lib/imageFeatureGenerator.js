var im = require('imagemagick');
var Q = require('q');

var ImageFeatureGenerator = {

	'getFeatures': function(params) {
		console.log('Inside getFeatures!!!');
		if (!params || !params.filePath) {
			throw 'Provide a valid file for processing';
		}

		var deferred = Q.defer();
		var filePath = params.filePath;
		im.identify(filePath, function(err, features) {
			if (err) {
				console.log('Error processing the image in ImageFeatureGenerator, error is '+ err);
				deferred.reject('Error processing the image in ImageFeatureGenerator, error is '+ err);
			} else {
				deferred.resolve(features);
			}
		});

		return deferred.promise;
	}
};

module.exports = ImageFeatureGenerator;