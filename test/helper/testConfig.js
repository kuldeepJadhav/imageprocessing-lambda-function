var test = {
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


global.config = {
    's3': {}
};

global.config.s3 = test;


global.imageSizes = [{
    'width': 300,
    'height': 300,
    'key': 'fullImageUrl'
}];
