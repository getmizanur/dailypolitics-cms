const ServiceManager = require('../service/service-manager');
const VarUtil = require('../util/var-util');
const express = require('express');

class Application {
    
    constructor(config = {}, serviceManager = null) {
        this.app = express(); 

        this.config = config;
        this.serviceManager = serviceManager;

        this._bootstrap = null;
    }

    bootstrap(resource = null) {
        if(this._bootstrap == null) {
            const Bootstrap = require(global.applicationPath('/application/bootstrap'));
            this._bootstrap = new Bootstrap(this.app);
        }

        let resources = this._bootstrap.getClassResources(this._bootstrap)
            .filter((item) => item.match(/^init/g));
        for(const resourceName of resources) { 
            this._bootstrap._executeResources(resourceName);
        }

        return this;
    }

    getConfig() {
        if(VarUtil.empty(this.config)) {
            this.config = require('../../application/config/application.config');
            return this.config;
        }

        return this.config;
    }

    getServiceManager() {
        if(VarUtil.isNull(this.serviceManager)) {
            this.serviceManager = new ServiceManager(this.getConfig())
            return this.serviceManager;
        }

        return this.serviceManager;
    }

    getBootstrap() {
        return this._bootstrap;
    }

    run() {
        this.getBootstrap().run();
    }

}

module.exports = Application;
