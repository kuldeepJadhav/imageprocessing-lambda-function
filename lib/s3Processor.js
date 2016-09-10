var s3ClientFactory = require('./s3ClientFactory');
var Q = require('q');


var s3Processor = {
	'downloadFile': function(bucketName, bucketKeyPrefix, fileToDownload) {
		console.log('Insisde download file', bucketName, bucketKeyPrefix, fileToDownload);
		var deferred = Q.defer();
		
		var client = s3ClientFactory.getInstance();
		var params = {
			localFile: global.config.s3.localTempDir + "/" + fileToDownload,
			s3Params: {
				Bucket: bucketName,
				Key: bucketKeyPrefix + "/" + fileToDownload,
			},
		};

		var downloader = client.downloadFile(params);
		downloader.on('end', function() {
			console.log('File downloaded', params.localFile);
			deferred.resolve(params.localFile);
		});

		downloader.on('error', function(err) {
			console.log('Error occured while downloading the file test.png, error is ' + err);
			deferred.reject('Error occured while downloading the file test.png, error is ' + err);
		});
		return deferred.promise;
	},

	'uploadFile': function(bucketName, s3BucketKeyPrefix, localFilePathToUpload, uploadedFileName) {
		console.log('Insisde upload file', bucketName, s3BucketKeyPrefix, localFilePathToUpload, uploadedFileName);
		var deferred = Q.defer();
		var params = {
			localFile: localFilePathToUpload,
			s3Params: {
				Bucket: bucketName,
				Key: s3BucketKeyPrefix + "/" + uploadedFileName
			}
		};
		var client = s3ClientFactory.getInstance();
		var uploader = client.uploadFile(params);

		uploader.on("end", function() {
			deferred.resolve(global.config.s3.cloudFrontDomain + "/" +s3BucketKeyPrefix + "/" + uploadedFileName);
		});

		uploader.on("error", function(err) {
			console.log('Error occured while uploading file '+ localFilePathToUpload+", error is "+err);
			deferred.reject('Error occured while uploading file '+ localFilePathToUpload+", error is "+err);
		});
		return deferred.promise;

	}
};

module.exports = s3Processor;