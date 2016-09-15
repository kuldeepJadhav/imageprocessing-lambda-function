var chai = require('chai')
var assert = chai.assert;
var sinon = require('sinon');
var expect = chai.expect;
var ImageFeatureGenerator = require('../lib/imageFeatureGenerator');
var testUtils = require('./helper/helper').testUtils;

describe('ImageFeatureGenerator ', function() {

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
	});

	afterEach(function() {
		sandbox.restore();
	});


	it('should be present', function() {
		assert.isNotNull(ImageFeatureGenerator);
	});

	it('should retrieve the feature of the provided file', function(done) {
		var imagemagick = require('imagemagick');
		sandbox.stub(imagemagick, 'identify', function(filePath, callback) {
			expect(filePath).to.equal('/tmp/testFile.png');
			callback(undefined, {
				'width': 200,
				'height': 200
			});
		});

		var promise = ImageFeatureGenerator.getFeatures({
			'filePath': '/tmp/testFile.png'
		});
		promise.then(function(features) {
			expect(features).to.deep.equal({
				'width': 200,
				'height': 200
			});
			testUtils.complete(done);
		});

	});

	it('should throw a error when file is not passed', function() {
		var fn = function() {
			ImageFeatureGenerator.getFeatures();
		};
		expect(fn).to.throw('Provide a valid file for processing');

		var fn = function() {
			ImageFeatureGenerator.getFeatures({});
		};
		expect(fn).to.throw('Provide a valid file for processing');

	});


	it('should throw a error when image processing fails', function(done) {
		var imagemagick = require('imagemagick');
		sandbox.stub(imagemagick, 'identify', function(filePath, callback) {
			callback('error');
		});

		var promise = ImageFeatureGenerator.getFeatures({
			'filePath': '/tmp/testFile.png'
		});
		promise.then(undefined, function(err) {
			expect(err).to.deep.equal('Error processing the image in ImageFeatureGenerator, error is error');
			testUtils.complete(done);
		});
	});

});