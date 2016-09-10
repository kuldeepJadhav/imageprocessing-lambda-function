var s3 = require('s3');

var s3ClientFactory = (function() {
	var client;

	function getClientParams() {
		console.log('Using region ', global.config.s3.destBucketS3Region);
		return {
			maxAsyncS3: 20,
			s3RetryCount: 3,
			s3RetryDelay: 1000,
			multipartUploadThreshold: 20971520, // 20 MB
			multipartUploadSize: 15728640, // 15 MB
			s3Options: {
				accessKeyId: global.config.s3.accessKeyId,
				secretAccessKey: global.config.s3.secretAccessKey
			}
		};
	}

	return {
		'getInstance': function() {
			if(!client) 
				client = require('s3').createClient(getClientParams());
			return client;
		}
	};

})();

module.exports = s3ClientFactory;