const ServiceManager = require('../library/service/service-manager');
const path = require('path');

global.applicationPath = function(filePath) {
    return path.resolve(__dirname) + '/..' + filePath;
}

const sm = new ServiceManager(
    require('../application/config/application.config')
)
const app = sm.get('Application')
    .bootstrap()
    .run();

module.exports = app;
