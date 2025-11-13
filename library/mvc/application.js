const express = require('express');

class Application {
    
    constructor(options = {}) {
        this.app = express(); 
        
        this._bootstrap = options.bootstrap || null;
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

    getBootstrap() {
        return this._bootstrap;
    }

    run() {
        this.getBootstrap().run();
    }

}

module.exports = Application;
