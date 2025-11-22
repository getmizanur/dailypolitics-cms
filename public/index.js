const path = require('path');

global.applicationPath = function(filePath) {
    return path.resolve(__dirname) + '/..' + filePath;
}

//const Session = require(global.applicationPath('/library/mvc/session/session'));
//Session.start();

const Application = require(global.applicationPath('/library/core/application'));
const app = (new Application())
    .bootstrap()
    .run();

module.exports = app;
