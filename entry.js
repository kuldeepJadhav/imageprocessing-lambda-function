

var env = process.env.NODE_ENV || 'dev';
global.config = {
	's3': {}
};

var prod = {
	'accessKeyId': '<access-key>',
	'secretAccessKey': '<amazon-secret>',
	'localTempDir': '/tmp',
	'cloudFrontDomain': '<cloud-front-url>',
	'destBucketName': '<dest-bucket-name>',
	'watermark': true,
	'thumbnailWaterMarkImagePath': 'water-mark-large.png',
	'fullWaterMarkImagePath': 'water-mark-large.png',
	'watermarkPosition': 'northwest',
	'destBucketS3Region': 'us-west-2',
	'serviceServer': '<service-server>',
	'servicePort': 3000,
	'authorization': 'Basic <encoded username-pass>'
};

var qa = {
	'accessKeyId': '<access-key>',
	'secretAccessKey': '<amazon-secret>',
	'localTempDir': '/tmp',
	'cloudFrontDomain': '<cloud-front-url>',
	'destBucketName': '<dest-bucket-name>',
	'watermark': true,
	'thumbnailWaterMarkImagePath': 'water-mark-large.png',
	'fullWaterMarkImagePath': 'water-mark-large.png',
	'watermarkPosition': 'northwest',
	'destBucketS3Region': 'us-west-2',
	'serviceServer': '<service-server>',
	'servicePort': 3000,
	'authorization': 'Basic <encoded username-pass>'
};

var dev = {
	'accessKeyId': '<access-key>',
	'secretAccessKey': '<amazon-secret>',
	'localTempDir': '/tmp',
	'cloudFrontDomain': '<cloud-front-url>',
	'destBucketName': '<dest-bucket-name>',
	'watermark': true,
	'thumbnailWaterMarkImagePath': 'water-mark-large.png',
	'fullWaterMarkImagePath': 'water-mark-large.png',
	'watermarkPosition': 'northwest',
	'destBucketS3Region': 'us-west-2',
	'serviceServer': '<service-server>',
	'servicePort': 3000,
	'authorization': 'Basic <encoded username-pass>'
};

global.imageSizes = [{
	'width': 900,
	'height': 450,
	'key': 'fullImageUrl'
}, {
	'width': 350,
	'height': 350,
	'key': 'coverImageUrl'
}, {
	'width': 1000,
	'height': 432,
	'key': 'coverImageLargeUrl'
}, {
	'width': 90,
	'height': 90,
	'key': 'thumbnailUrl'
}, {
	'width': 360,
	'height': 360,
	'key': 'coverImageUrlForMobile'
}];

//for tests
console.log('Initializing test');
switch (env.toUpperCase()) {
	case 'TEST':
		global.config.s3 = {
			'accessKeyId': 'test',
			'secretAccessKey': 'test',
			'localTempDir': '/tmp',
			'cloudFrontDomain': 'https://test',
			'destBucketName': 'destBucket',
			'watermark': true,
			'thumbnailWaterMarkText': 'P',
			'normalWaterMarkText': 'P',
			'serviceServer': 'test.com',
			'servicePort': 3000
		}
		global.imageSizes = [{
			'width': 300,
			'height': 300,
			'key': 'fullImageUrl'
		}];
}


exports.handler = function(event, context) {

	console.log('Lambda execution started....');

	var Processor = require('./lib/processor');

	var srcBucket = event.Records[0].s3.bucket.name;
	console.log('srcBucket', srcBucket);
	var fileName = event.Records[0].s3.object.key.substring(event.Records[0].s3.object.key.lastIndexOf('/') + 1);
	console.log('fileName', fileName);
	var srcBucketPrefix = event.Records[0].s3.object.key.substring(0, event.Records[0].s3.object.key.lastIndexOf('/'));
	console.log('srcBucketPrefix', srcBucketPrefix);
	var params = srcBucketPrefix.split("/");
	console.log('params', params);
	var env = params[0];
	var date = params[1];
	var userId = params[2];
	var postId = params[3];

	console.log('env is ', env);

	var conf = dev;
	switch (env) {
		case 'prod':
			conf = prod;
			break;
		case 'qa':
			conf = qa;
			break;
	}

	global.config.s3 = conf;


	var destBucket = global.config.s3.destBucketName;
	console.log('destBucket', destBucket);
	var destBucketKeyPrefix = date + "/" + userId;
	console.log('destBucketKeyPrefix', destBucketKeyPrefix);
	console.log('Calling process with ', srcBucket, destBucket, srcBucketPrefix, destBucketKeyPrefix, fileName);
	var processor = new Processor(srcBucket, destBucket, srcBucketPrefix, destBucketKeyPrefix, fileName);

	var promise = processor.process();
	var imageUpdater = require('./lib/imageUpdater');
	promise.then(function(data) {
		console.log('Successfully resized the file ', data);
		console.log('hitting the service to store the image urls');
		imageUpdater.storeImageUrls(postId, env, data);

	}, function(err) {
		console.log('Error resizing the file ', event.Records[0].s3.bucket.name, fileName);
	});


};