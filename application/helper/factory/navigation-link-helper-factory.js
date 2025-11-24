const AbstractViewHelperFactory = require(global.applicationPath('/library/mvc/view/abstract-view-helper-factory'));
const NavigationLinkHelper = require(global.applicationPath('/application/helper/navigation-link-helper'));

/**
 * NavigationLinkHelperFactory
 * Factory for creating NavigationLinkHelper with dependencies injected
 */
class NavigationLinkHelperFactory extends AbstractViewHelperFactory {

    /**
     * Create NavigationLinkHelper with dependencies
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {NavigationLinkHelper} NavigationLinkHelper instance with dependencies
     */
    createService(serviceManager) {
        // Create NavigationLinkHelper instance
        const helper = new NavigationLinkHelper();

        // ServiceManager may be null during bootstrap - return helper with defaults
        if (!serviceManager) {
            return helper;
        }

        // Get RouteMatch from ServiceManager
        const routeMatch = serviceManager.getRouteMatch();

        // Get URL helper from ViewHelperManager
        const viewHelperManager = serviceManager.get('ViewHelperManager');
        const urlHelper = viewHelperManager.get('url');

        // Get authentication service
        let isAuthenticated = false;
        try {
            const authService = serviceManager.get('AuthenticationService');
            isAuthenticated = authService && authService.hasIdentity();
        } catch (error) {
            // AuthenticationService may not be available in all contexts
            isAuthenticated = false;
        }

        // Inject dependencies
        helper.setRouteMatch(routeMatch);
        helper.setUrlHelper(urlHelper);
        helper.setIsAuthenticated(isAuthenticated);

        return helper;
    }

}

module.exports = NavigationLinkHelperFactory;
