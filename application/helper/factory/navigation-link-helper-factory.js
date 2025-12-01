const AbstractViewHelperFactory = require(global.applicationPath('/library/mvc/view/abstract-view-helper-factory'));
const NavigationLinkHelper = require(global.applicationPath('/application/helper/navigation-link-helper'));

/**
 * NavigationLinkHelperFactory
 * Factory for creating NavigationLinkHelper with dependencies injected
 */
class NavigationLinkHelperFactory extends AbstractViewHelperFactory {

    /**
     * Create NavigationLinkHelper
     * @returns {NavigationLinkHelper} NavigationLinkHelper instance
     */
    createService(serviceManager) {
        // Get AuthenticationService
        const authService = serviceManager.get('AuthenticationService');

        // Create NavigationLinkHelper instance with dependency
        return new NavigationLinkHelper(authService);
    }

}

module.exports = NavigationLinkHelperFactory;
