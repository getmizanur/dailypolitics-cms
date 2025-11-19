const BasePlugin = require(global.applicationPath('/library/controller/basePlugin'));

class PageTitle extends BasePlugin {

    constructor(options = {}) {
        super(options);
        this.defaultTitle = 'Application Portal';
        // Inject default title on first access
        this._shouldInjectDefault = true;
    }

    /**
     * Set custom page title (convenience method)
     * Automatically injects the title into template variable
     * @param {string} title - Custom page title
     * @returns {PageTitle} For method chaining
     */
    setTitle(title) {
        this._shouldInjectDefault = false; // Custom title set, no need for default
        this._injectTemplateVariable(title);
        return this;
    }

    /**
     * Get current page title or default
     * Lazily injects default title if none has been set
     * @returns {string} Current page title or default
     */
    getTitle() {
        try {
            // Inject default title on first access if no custom title was set
            if (this._shouldInjectDefault) {
                this._injectTemplateVariable(this.defaultTitle);
                this._shouldInjectDefault = false;
            }

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
     * Set default title for this plugin instance
     * @param {string} title - Default title
     * @returns {PageTitle} For method chaining
     */
    setDefaultTitle(title) {
        this.defaultTitle = title;
        // If no custom title has been set yet, inject this default
        if (this._shouldInjectDefault) {
            this._injectTemplateVariable(title);
        }
        return this;
    }

    /**
     * Get default title
     * @returns {string} Default title
     */
    getDefaultTitle() {
        return this.defaultTitle;
    }

    /**
     * Auto-inject page title into template variable
     * Private method called when title is set
     * @param {string} title - The title to inject
     */
    _injectTemplateVariable(title) {
        try {
            const controller = this.getController();
            if (!controller) {
                // Controller not set yet, skip injection
                return;
            }

            const view = controller.getView();
            if (!view || typeof view.setVariable !== 'function') {
                // View not ready yet, skip injection
                return;
            }

            // Use provided title or fall back to default
            const titleToSet = title || this.defaultTitle;
            view.setVariable('pageTitle', titleToSet);
        } catch (error) {
            // Silently fail - template variable will use default or be undefined
        }
    }
}

module.exports = PageTitle;