const AbstractHelper = require(global.applicationPath('/library/mvc/view/helper/abstract-helper'));

/**
 * NavigationLinkHelper
 * Helper to conditionally render navigation links based on module and authentication status
 * Shows "Logout" on admin pages (except login), otherwise shows "Contact Us"
 */
class NavigationLinkHelper extends AbstractHelper {

    constructor() {
        super();
        this.routeMatch = null;
        this.urlHelper = null;
        this.isAuthenticated = false;
    }

    /**
     * Set RouteMatch instance
     * @param {RouteMatch} routeMatch - RouteMatch instance
     * @returns {NavigationLinkHelper} For method chaining
     */
    setRouteMatch(routeMatch) {
        this.routeMatch = routeMatch;
        return this;
    }

    /**
     * Set URL helper instance
     * @param {Object} urlHelper - URL helper instance
     * @returns {NavigationLinkHelper} For method chaining
     */
    setUrlHelper(urlHelper) {
        this.urlHelper = urlHelper;
        return this;
    }

    /**
     * Set authentication status
     * @param {boolean} isAuthenticated - Authentication status
     * @returns {NavigationLinkHelper} For method chaining
     */
    setIsAuthenticated(isAuthenticated) {
        this.isAuthenticated = isAuthenticated;
        return this;
    }

    /**
     * Render the appropriate navigation link based on context
     * @returns {string} HTML link for navigation
     */
    render(...args) {
        // Extract Nunjucks context from arguments
        this._extractContext(args);

        // Get route information from RouteMatch
        const module = this.routeMatch ? this.routeMatch.getParam('module') : null;
        const controller = this.routeMatch ? this.routeMatch.getParam('controller') : null;

        // Check if we're on an admin page (except login)
        const isAdminModule = module === 'admin';
        const isLoginController = controller === 'login';

        // Show Logout link on admin pages (except login page) when authenticated
        if (isAdminModule && !isLoginController && this.isAuthenticated) {
            const logoutUrl = this.urlHelper.fromRoute('adminLoginLogout');
            return `<a href="${logoutUrl}" class="btn nav-font-white">LOGOUT</a>`;
        }

        // Show Contact Us link for all other cases
        // Note: Using hardcoded /contact as there's no route defined for it yet
        // TODO: Add contactIndex route to routes.config.js
        return '<a href="/contact" class="btn nav-font-white">CONTACT-US</a>';
    }
}

module.exports = NavigationLinkHelper;
