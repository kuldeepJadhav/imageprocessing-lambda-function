

'use strict';

var TestUtils = function () {
};

TestUtils.prototype.complete = function (done, err) {
    if (err) {
        done(err);
    } else {
        done();
    }
};

module.exports = {
    'testUtils': new TestUtils()
};
