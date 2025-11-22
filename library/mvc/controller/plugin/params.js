const BasePlugin = require('../base-plugin');

class Params extends BasePlugin {

    constructor(options = {}) {
        super(options);

        let controller = options.controller;
    }

    fromHeader(header = null, defaultValue = null) {
        let controller = super.getController();
        let request = controller.getRequest();
    }

    fromPost(param = null, defaultValue = null) {
        let controller = super.getController();
        let request = controller.getRequest();
    }

    fromQuery(param = null, defaultValue = null) {
    }

    fromRoute(param = null, defaultValue = null) {
    }

}

module.exports = Params;
