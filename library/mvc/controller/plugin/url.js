const BasePlugin = require('../basePlugin');

class Url extends BasePlugin {

    constructor(options = {}) {
        super(options);
    }

    fromRoute(name, params = {}, options = {}) { 
        let controller = super.getController();            
        let routes = controller.getConfig().get('routes');

        let route = null;
        if(routes.hasOwnProperty(name)) {
            route = routes[name].route;
            for(let key in params) {
                let regEx = new RegExp(':' + key);
                route = route.replace(regEx, params[key]);
            }
        }

        return route;
    }

}

module.exports = Url;
