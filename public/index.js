const ServiceManager = require('../library/service/service-manager');
const path = require('path');

global.applicationPath = function(filePath) {
    return path.resolve(__dirname) + '/..' + filePath;
}

//const Session = require(global.applicationPath('/library/mvc/session/session'));
//Session.start();

const sm = new ServiceManager(
    require('../application/config/application.config')
)
const Application = require(global.applicationPath('/library/core/application'));
const app = sm.get('Application')
    .bootstrap()
    .run();

module.exports = app;
