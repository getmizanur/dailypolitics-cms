const BasePlugin = require(global.applicationPath('/library/controller/basePlugin'));

class PageTitle extends BasePlugin {

    constructor(options = {}) {
        super(options);
        this.defaultTitle = 'Application Portal';
    }

    /**
     * Set custom page title (convenience method)
     * @param {string} title - Custom page title
     * @returns {PageTitle} For method chaining
     */
    setTitle(title) {
        this.getController().getView().setVariable('pageTitle', title);
        return this;
    }

    /**
     * Get current page title or default
     * @returns {string} Current page title or default
     */
    getTitle() {
        const pageTitle = this.getController().getView().getVariable('pageTitle');
        return pageTitle || this.defaultTitle;
    }

    /**
     * Initialize default page title if none has been set
     * Called during post-dispatch to ensure a title is always available
     */
    initializePageTitle() {
        const view = this.getController().getView();
        if (!view.getVariable('pageTitle')) {
            view.setVariable('pageTitle', this.defaultTitle);
        }
    }

    /**
     * Set default title for this plugin instance
     * @param {string} title - Default title
     * @returns {PageTitle} For method chaining
     */
    setDefaultTitle(title) {
        this.defaultTitle = title;
        return this;
    }

    /**
     * Get default title
     * @returns {string} Default title
     */
    getDefaultTitle() {
        return this.defaultTitle;
    }
}

module.exports = PageTitle;