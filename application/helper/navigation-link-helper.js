const AbstractHelper = require(global.applicationPath('/library/mvc/view/helper/abstract-helper'));

/**
 * NavigationLinkHelper
 * Helper to check if user is authenticated
 * Returns boolean value for templates to handle display logic
 */
class NavigationLinkHelper extends AbstractHelper {

    constructor() {
        super();
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    render(...args) {
        // Extract Nunjucks context from arguments
        this._extractContext(args);

        try {
            // Check directly in global.locals.expressSession which is set during requests
            if (typeof global !== 'undefined' && global.locals && global.locals.expressSession) {
                const session = global.locals.expressSession;

                // Check if AuthIdentity exists and has an identity
                if (session.customData &&
                    session.customData.AuthIdentity &&
                    session.customData.AuthIdentity.identity) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('[NavigationLink] Error checking authentication:', error.message);
            return false;
        }
    }
}

module.exports = NavigationLinkHelper;
