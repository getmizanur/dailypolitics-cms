const AbstractHelper = require('./abstractHelper');

class HeadTitle extends AbstractHelper {

    constructor() {
        super();
        this.titles = [];
        this.separator = ' | ';
        this.defaultTitle = 'Application Portal';
    }

    /**
     * Main render method - can be called with various parameters
     * @param {string} title - Title to set, append, or null for automatic generation
     * @param {string} routeName - Route name for automatic title generation
     * @returns {string} Rendered title
     */
    render(title = null) {
        if (title === null) {
            // No title or route - return default
            return this.defaultTitle;
        }
        
        // Custom title provided - set and return
        this.set(title);
        return this.toString();
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