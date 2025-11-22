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

            // Replace provided params
            for(let key in params) {
                let regEx = new RegExp(':' + key, 'g');
                route = route.replace(regEx, params[key]);
            }

            // Remove optional segments that still contain unreplaced parameters
            // Pattern: (/segment/:param)? or (/segment)?
            route = route.replace(/\([^)]*:[^)]*\)\?/g, '');

            // Remove remaining optional parentheses with no params
            route = route.replace(/\(\/?([^):]*)\)\?/g, '$1');
        }

        return route;
    }

}

module.exports = Url;
