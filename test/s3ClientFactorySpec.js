var chai = require('chai')
var assert = chai.assert;
var sinon = require('sinon');
var expect = chai.expect;
var s3ClientFactory = require('../lib/s3ClientFactory');
var testUtils = require('./helper/helper').testUtils;

describe('S3ClientFactory ', function() {

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});


	it('should be present', function() {
		console.log('s3ClientFactory ', s3ClientFactory);
		assert.isNotNull(s3ClientFactory);
	});


	it('should return the amazon s3 client', function() {
		var s3 = require('s3');
		sandbox.stub(s3, 'createClient', function(params) {
			expect(params).to.not.be.undefined;
			assert.isNotNull(params);
			return {
				'test': 'test'
			};
		});
		var instance = s3ClientFactory.getInstance();
		assert.isNotNull(instance);
	});

	it('should return the same amazon s3 client if it is already created', function() {
		var s3 = require('s3');
		sandbox.stub(s3, 'createClient', function(params) {
			expect(params).to.not.be.undefined;
			assert.isNotNull(params);
			return {
				'test': 'test'
			};
		});
		var instance = s3ClientFactory.getInstance();
		var instance1 = s3ClientFactory.getInstance();
		expect(instance === instance1).to.equal(true);
		
	});
	



});