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
        try {
            const view = this.getController().getView();
            if (!view || typeof view.setVariable !== 'function') {
                console.error('PageTitle.setTitle: view is not a proper ViewModel instance:', typeof view, view);
                return this;
            }
            view.setVariable('pageTitle', title);
        } catch (error) {
            console.error('PageTitle.setTitle error:', error);
        }
        return this;
    }

    /**
     * Get current page title or default
     * @returns {string} Current page title or default
     */
    getTitle() {
        try {
            const view = this.getController().getView();
            if (!view || typeof view.getVariable !== 'function') {
                console.error('PageTitle.getTitle: view is not a proper ViewModel instance:', typeof view, view);
                return this.defaultTitle;
            }
            const pageTitle = view.getVariable('pageTitle');
            return pageTitle || this.defaultTitle;
        } catch (error) {
            console.error('PageTitle.getTitle error:', error);
            return this.defaultTitle;
        }
    }

    /**
     * Initialize default page title if none has been set
     * Called during post-dispatch to ensure a title is always available
     */
    initializePageTitle() {
        try {
            const view = this.getController().getView();
            if (!view || typeof view.getVariable !== 'function') {
                console.error('PageTitle.initializePageTitle: view is not a proper ViewModel instance:', typeof view, view);
                return;
            }
            if (!view.getVariable('pageTitle')) {
                view.setVariable('pageTitle', this.defaultTitle);
            }
        } catch (error) {
            console.error('PageTitle.initializePageTitle error:', error);
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