
var chai = require('chai')
var assert = chai.assert;
var sinon = require('sinon');
var expect = chai.expect;
var Processor = require('../lib/processor');
var testUtils = require('./helper/helper').testUtils;
var imageFeatureGenerator = require('../lib/imageFeatureGenerator');
var s3Processor = require('../lib/s3Processor');

describe('Processor ', function() {

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});


	it('should be present', function() {
		assert.isNotNull(Processor);
	});

	it('should initialize the processor details', function() {
		var destBucket = "destBucket";
		var destBucketKeyPrefix = "destBucketKeyPrefix";
		var srcFileName = "srcFileName";
		var srcFilePath = "/tmp/xyz.png";
		var processor = new Processor(srcFileName, srcFilePath, destBucket, destBucketKeyPrefix);

		expect(processor.srcFileName).to.equal("srcFileName");
		expect(processor.destBucket).to.equal("destBucket");
		expect(processor.destBucketKeyPrefix).to.equal("destBucketKeyPrefix");
		expect(processor.localFilePath).to.equal("/tmp/xyz.png");
	});


	it('should resize the image based on the sizes provided', function(done) {
		var Q = require('Q');
		var easyimg = require('easyimage');
		sandbox.stub(imageFeatureGenerator, 'getFeatures', function(params) {
			console.log('Imafe feature generator mock called');
			expect(params).to.deep.equal({
				'filePath': '/tmp/test.png'
			});

			var deferred = Q.defer();
			deferred.resolve({
				'width': 300,
				'height': 300
			});
			return deferred.promise;
		});

		sandbox.stub(easyimg, 'exec', function() {

			var deferred = Q.defer();
			deferred.resolve();
			return deferred.promise;
		});

		sandbox.stub(s3Processor, 'uploadFile', function(destBucket, destBucketKeyPrefix, destPath, uploadFileName) {
			expect(destBucket).to.deep.equal('destBucket');
			expect(destBucketKeyPrefix).to.deep.equal('/testimagesdest');
			expect(destPath).to.deep.equal('/tmp/srcFileName0.png');
			expect(uploadFileName).to.deep.equal('srcFileName300X300.png');
			var deferred = Q.defer();
			deferred.resolve('https://test/srcFileName300X300.png');
			return deferred.promise;
		});

		var destBucket = "destBucket";
		var destBucketKeyPrefix = "/testimagesdest";
		var srcFileName = "srcFileName.png";
		var srcFilePath = "/tmp/test.png";
		var processor = new Processor(srcFileName, srcFilePath, destBucket, destBucketKeyPrefix);
		var promise = processor.process();
		promise.then(function(data) {
			expect(data).to.deep.equal({
				'fullImageUrl': 'https://test/srcFileName300X300.png'
			});
			testUtils.complete(done);
		});
	});

	it('should throw a error when image processing fails', function(done) {
		var Q = require('Q');
		sandbox.stub(s3Processor, 'downloadFile', function(bucketName, bucketKeyPrefix, fileToDownload, newFileName) {
			expect(bucketName).to.equal('srcBucket');
			expect(bucketKeyPrefix).to.equal('/testimages');
			expect(fileToDownload).to.equal('test.png');
			var deferred = Q.defer();
			deferred.resolve('/tmp/test.png');
			return deferred.promise;
		});

		sandbox.stub(imageFeatureGenerator, 'getFeatures', function(params) {
			expect(params).to.deep.equal({
				'filePath': '/tmp/test.png'
			});
			var deferred = Q.defer();
			deferred.reject('error');
			return deferred.promise;
		});


		var processor = new Processor('srcBucket', '/tmp/test.png', 'destBucket', 'destPrefix');
		var promise = processor.process();
		promise.then(undefined, function(data) {
			expect(data).to.deep.equal('error');
			testUtils.complete(done);
		});
	 });

});