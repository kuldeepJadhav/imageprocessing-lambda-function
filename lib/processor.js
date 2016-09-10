var imageFeatureGenerator = require('./imageFeatureGenerator');
var s3Processor = require('./s3Processor');
var Q = require('q');
var easyimg = require('easyimage');

var Processor = function(srcFileName, localFilePath, destBucket, destBucketKeyPrefix) {
	this.destBucket = destBucket;
	this.destBucketKeyPrefix = destBucketKeyPrefix;
	this.srcFileName = srcFileName;
	this.localFilePath = localFilePath;
};

Processor.prototype.process = function() {
	var deferred = Q.defer();
	var downloadedFilePath;
	var self = this;
	var finalPath = {};
	var imageProcessingCount = 0;
	imageFeatureGenerator.getFeatures({
		'filePath': self.localFilePath
	}).then(function(features) {
		
		var actualWidth = features.width;
		var actualHeight = features.height;
		console.log('self.srcFileName is ', self.srcFileName);
		var actualFileName = self.srcFileName.substring(0, self.srcFileName.lastIndexOf('.'));
		var extension = self.srcFileName.substring(self.srcFileName.lastIndexOf('.') );
		console.log('actualFileName is ', actualFileName);
		console.log('extension is ', extension);
		for (var i = 0; i < global.imageSizes.length; i++) {
			var width = global.imageSizes[i].width;
			var height = global.imageSizes[i].height;
			var key = global.imageSizes[i].key;
			var resizeWidth = ((actualWidth > width) ? width : actualWidth);
			var resizeHeight = ((actualHeight > height) ? height : actualHeight);
			var uploadFileName =  actualFileName + width + "X" + height + '' + extension;
			var destPath = global.config.s3.localTempDir + '/' + actualFileName + '' + i + '' + extension;
			console.log('global.config.s3  ', global.config.s3);
			(function(destPath, uploadFileName, key) {
				var command = 'convert ' + self.localFilePath + ' -resize ' + resizeWidth + 'x' + resizeHeight + ' -gravity center -background grey -extent ' + width + 'x' + height + ' ' + destPath;
				var compositeCommand = getWaterMarkCommand(destPath, key);
				compositeCommand = (compositeCommand !== null ? ' && ' + compositeCommand : '');
				command = command + compositeCommand;
				easyimg.exec(command).then(function(data) {
						console.log('output from easy magick ', data);
						console.log(self.destBucket, self.destBucketKeyPrefix, destPath, uploadFileName);
						return s3Processor.uploadFile(self.destBucket, self.destBucketKeyPrefix, destPath, uploadFileName);
					})
					.then(function(cloudFrontPath) {
						console.log('Image uploaded!!!!', cloudFrontPath);
						finalPath[key] = cloudFrontPath;
						imageProcessingCount++;
						if (imageProcessingCount === global.imageSizes.length) {
							deferred.resolve(finalPath);
						}
					}).fail(function(err) {
						console.log('Error while processing individual image ' + destPath + ' error is ' + err);
						console.log('Continuing processing other images...');
						imageProcessingCount++;
						if (imageProcessingCount === global.imageSizes.length) {
							deferred.resolve(finalPath);
						}
					});
			})(destPath, uploadFileName, key);

		}
	}).fail(function(err) {
		console.log('Error occured while image processing, error is ' + err);
		deferred.reject(err);
	});
	return deferred.promise;
};


function getWaterMarkCommand(imagePathToWaterMark, imageType) {
	var compositeCommand = null;
	if (global.config.s3.watermark) {
		var waterMarkImage = (imageType === 'thumbnailUrl') ? global.config.s3.thumbnailWaterMarkImagePath : global.config.s3.fullWaterMarkImagePath;
		compositeCommand = 'composite -compose atop -geometry +10+10 -gravity ' + global.config.s3.watermarkPosition + ' ' + waterMarkImage + ' ' + imagePathToWaterMark + ' ' + imagePathToWaterMark;
	}
	return compositeCommand;
}

module.exports = Processor;