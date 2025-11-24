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
    createService() {
        // Create NavigationLinkHelper instance
        // No dependencies needed - it checks authentication directly from global.locals.expressSession
        return new NavigationLinkHelper();
    }

}

module.exports = NavigationLinkHelperFactory;
