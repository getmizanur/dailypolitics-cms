const BaseController = require('./baseController');

class BasePlugin {

    constructor(options = {}) {
        this.controller = null;
    }

    setController(controller) {
        if(!(controller instanceof BaseController)) {
            throw new Error('The class is not a BaseController instance.');
        }

        this.controller = controller;
    }

    getController() {
        return this.controller;
    }

}

module.exports = BasePlugin;
