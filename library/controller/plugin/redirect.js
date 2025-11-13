const BasePlugin = require('../basePlugin');
const VarUtil = require('../../util/varUtil');

class Redirect extends BasePlugin {

    constructor(options = {}) {
        super(options);
    }

    toUrl(route = null, params = {}, options = {}) {
        let controller = super.getController();
        let response = controller.getResponse();
        let urlPlugin = controller.plugin('url');

        let url = urlPlugin.fromRoute(route, params);

        response.setRedirect(url); 

        return response;
    }

}

module.exports = Redirect;
