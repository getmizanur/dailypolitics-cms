const AbstractHelper = require('./abstractHelper');

class HeadTitle extends AbstractHelper {

    constructor() {
        super();
        this.separator = ' - ';
        this.defaultTitle = 'Application Portal';
    }

    /**
     * Main render method - can be called with various parameters
     * Supports persistent title building via Nunjucks context
     * @param {string|null} title - Title to set/append
     * @param {string} mode - 'set', 'append', 'prepend', or 'render' (default: 'set')
     * @returns {string} Rendered title or empty string if setting for later
     */
    render(...args) {
        // Extract Nunjucks context from arguments
        const cleanArgs = this._extractContext(args);
        const [title = null, mode = 'set'] = cleanArgs;

        // Get stored titles from context or initialize
        let titles = this.getVariable('_headTitleParts', []);

        if (title === null && mode === 'set') {
            // No arguments - just render what we have
            return this._renderTitles(titles);
        }

        // Handle different modes
        switch (mode) {
            case 'set':
                titles = [title];
                break;
            case 'append':
                titles.push(title);
                break;
            case 'prepend':
                titles.unshift(title);
                break;
            case 'render':
                // Just render without modifying
                return this._renderTitles(titles);
        }

        // Store updated titles back to context
        this.setVariable('_headTitleParts', titles);

        // For set/append/prepend, return empty string (they're building, not rendering)
        if (mode !== 'render') {
            return '';
        }

        return this._renderTitles(titles);
    }

    /**
     * Render titles array to string
     * @param {Array} titles - Array of title parts
     * @returns {string}
     */
    _renderTitles(titles) {
        if (!titles || titles.length === 0) {
            return this.defaultTitle;
        }
        return titles.join(this.separator);
    }

    /**
     * Set the title (replaces all existing titles)
     * @param {string} title - Title to set
     * @returns {HeadTitle} For method chaining
     */
    set(title) {
        this.titles = [title];
        return this;
    }

    /**
     * Append a title to the end
     * @param {string} title - Title to append
     * @returns {HeadTitle} For method chaining
     */
    append(title) {
        this.titles.push(title);
        return this;
    }

    /**
     * Prepend a title to the beginning
     * @param {string} title - Title to prepend
     * @returns {HeadTitle} For method chaining
     */
    prepend(title) {
        this.titles.unshift(title);
        return this;
    }

    /**
     * Set the separator between titles
     * @param {string} separator - Separator string
     * @returns {HeadTitle} For method chaining
     */
    setSeparator(separator) {
        this.separator = separator;
        return this;
    }

    /**
     * Set default title
     * @param {string} title - Default title
     * @returns {HeadTitle} For method chaining
     */
    setDefaultTitle(title) {
        this.defaultTitle = title;
        return this;
    }

    /**
     * Get all titles
     * @returns {Array} Array of titles
     */
    getTitles() {
        return this.titles;
    }

    /**
     * Clear all titles
     * @returns {HeadTitle} For method chaining
     */
    clear() {
        this.titles = [];
        return this;
    }

    /**
     * Check if titles are empty
     * @returns {boolean} True if no titles set
     */
    isEmpty() {
        return this.titles.length === 0;
    }

    /**
     * Convert to string representation
     * @returns {string} Formatted title string
     */
    toString() {
        if (this.isEmpty()) {
            return this.defaultTitle;
        }
        
        return this.titles.join(this.separator);
    }

}

module.exports = HeadTitle;