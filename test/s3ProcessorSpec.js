var chai = require('chai')
var assert = chai.assert;
var sinon = require('sinon');
var expect = chai.expect;
var s3Processor = require('../lib/s3Processor');
var s3ClientFactory = require('../lib/s3ClientFactory');
var testUtils = require('./helper/helper').testUtils;

describe('S3Processor ', function() {

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});


	it('should be present', function() {
		assert.isNotNull(s3Processor);
	});


	it('should download the file from provided s3 bucket', function(done) {
		var fileNameToDownload = 'test.png';
		var s3BucketKey = '/test/images';
		var bucketName = 'testBucket';
		sandbox.stub(s3ClientFactory, 'getInstance', function() {
			return {
				'downloadFile': function(params) {
					expect(params).to.deep.equal({
						localFile: "/tmp/test.png",
						s3Params: {
							Bucket: "testBucket",
							Key: "/test/images/test.png",
						},
					});

					return {
						'on': function(event, callback) {
							if (event === 'end') {
								callback();
							}
						}
					};
				}
			};
		});
		var promise = s3Processor.downloadFile(bucketName, s3BucketKey, fileNameToDownload);
		promise.then(function(data) {
			expect(data).to.equal('/tmp/test.png');
			testUtils.complete(done);
		});
	});


	it('should throw a proper error when downloading fails', function(done) {
		var fileNameToDownload = 'test.png';
		var s3BucketKey = '/test/images';
		var bucketName = 'testBucket';
		sandbox.stub(s3ClientFactory, 'getInstance', function() {
			return {
				'downloadFile': function(params) {
					return {
						'on': function(event, callback) {
							if (event === 'error') {
								callback('error')
							}
						}
					};
				}
			};
		});
		var promise = s3Processor.downloadFile(bucketName, s3BucketKey, fileNameToDownload);
		promise.then(undefined, function(error) {
			expect(error).to.equal('Error occured while downloading the file test.png, error is error');
			testUtils.complete(done);
		});
	});


	it('should upload the file to the provided s3 bucket', function() {
		var localFilePathToUpload = '/tmp/test.png';
		var s3BucketKeyPrefix = '/test/images';
		var bucketName = 'testBucket';
		var uploadedFileName = 'test1.png';

		sandbox.stub(s3ClientFactory, 'getInstance', function() {
			return {
				'uploadFile': function(params) {
					expect(params).to.deep.equal({
						localFile: '/tmp/test.png',

						s3Params: {
							Bucket: "testBucket",
							Key: "/test/images/test1.png"
						}
					});
					return {
						'on': function(event, callback) {
							if (event === 'end') {
								callback()
							}
						}
					};
				}
			};
		});

		var promise = s3Processor.uploadFile(bucketName, s3BucketKeyPrefix, localFilePathToUpload, uploadedFileName);
		promise.then(function(data) {
			expect(data).to.deep.equal('http://test/test/images/test1.png');
		});
	});

	it('should throw a error if uploading of file fails', function() {
		var localFilePathToUpload = '/tmp/test.png';
		var s3BucketKeyPrefix = '/test/images';
		var bucketName = 'testBucket';
		var uploadedFileName = 'test1.png';

		sandbox.stub(s3ClientFactory, 'getInstance', function() {
			return {
				'uploadFile': function(params) {
					return {
						'on': function(event, callback) {
							if (event === 'error') {
								callback('error')
							}
						}
					};
				}
			};
		});

		var promise = s3Processor.uploadFile(bucketName, s3BucketKeyPrefix, localFilePathToUpload, uploadedFileName);
		promise.then(undefined, function(data) {
			expect(data).to.deep.equal('Error occured while uploading file /tmp/test.png, error is error');
		});
	});



});