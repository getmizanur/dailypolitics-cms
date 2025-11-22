const AbstractHelper = require('./abstractHelper');

/**
 * URL Helper for Views
 * Generates URLs from route names and parameters
 */
class Url extends AbstractHelper {

    constructor() {
        super();
        this.routes = null;
    }

    /**
     * Load routes configuration from Container
     * @returns {Object} Routes configuration
     */
    _getRoutes() {
        if (this.routes) {
            return this.routes;
        }

        // Load routes from Container
        try {
            const Container = require('../../../core/container');
            const container = new Container('__framework');

            if (container.has('routesConfig')) {
                this.routes = container.get('routesConfig');
                return this.routes;
            }

            // Fallback: load from config file if not in Container
            const routesConfig = require(global.applicationPath('/application/config/routes.config.js'));
            this.routes = routesConfig.routes || {};
            return this.routes;
        } catch (error) {
            console.error('Failed to load routes configuration:', error.message);
            return {};
        }
    }

    /**
     * Generate URL from route name and parameters
     * @param {string} routeName - Name of the route
     * @param {Object} params - Parameters to replace in route pattern
     * @returns {string} Generated URL
     */
    fromRoute(routeName, params = {}) {
        const cleanArgs = this._extractContext(arguments);
        const name = cleanArgs[0];
        const parameters = cleanArgs[1] || {};

        const routes = this._getRoutes();

        if (!routes.hasOwnProperty(name)) {
            console.warn(`Route '${name}' not found in routes configuration`);
            return '';
        }

        let route = routes[name].route;

        // Replace provided params
        for (let key in parameters) {
            const regEx = new RegExp(':' + key, 'g');
            route = route.replace(regEx, parameters[key]);
        }

        // Remove optional segments that still contain unreplaced parameters
        // Pattern: (/segment/:param)? or (/segment)?
        route = route.replace(/\([^)]*:[^)]*\)\?/g, '');

        // Remove remaining optional parentheses with no params
        route = route.replace(/\(\/?([^):]*)\)\?/g, '$1');

        return route;
    }

    /**
     * Main render method that can be called from templates
     * @param {string} routeName - Name of the route
     * @param {Object} params - Parameters to replace in route pattern
     * @returns {string} Generated URL
     */
    render(routeName, params = {}) {
        return this.fromRoute(routeName, params);
    }

}

module.exports = Url;
