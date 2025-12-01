const AbstractHelper = require(global.applicationPath('/library/mvc/view/helper/abstract-helper'));

/**
 * NavigationLinkHelper
 * Helper to check if user is authenticated
 * Returns boolean value for templates to handle display logic
 */
class NavigationLinkHelper extends AbstractHelper {

    constructor(authService) {
        super();
        this.authService = authService;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    render(...args) {
        // Extract Nunjucks context from arguments
        this._extractContext(args);

        try {
            if (this.authService && this.authService.hasIdentity()) {
                return true;
            }

            return false;
        } catch (error) {
            console.error('[NavigationLink] Error checking authentication:', error.message);
            return false;
        }
    }
}

module.exports = NavigationLinkHelper;
