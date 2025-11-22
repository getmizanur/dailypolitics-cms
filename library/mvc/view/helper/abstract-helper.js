
class AbstractHelper {

    constructor() {
        this.nunjucksContext = null;
    }

    /**
     * Extract Nunjucks context from arguments if present
     * The context is always passed as the last argument and is an object with ctx property
     * @param {Array} args - Arguments array
     * @returns {Array} Arguments with context removed
     */
    _extractContext(args) {
        if (args.length === 0) {
            return args;
        }

        const lastArg = args[args.length - 1];

        // Check if last argument is the Nunjucks context object
        // Nunjucks context has specific properties like ctx, env, etc.
        if (lastArg && typeof lastArg === 'object' &&
            (lastArg.ctx !== undefined || lastArg.env !== undefined || lastArg.getVariables !== undefined)) {
            this.nunjucksContext = lastArg;
            return args.slice(0, -1); // Remove context from args
        }

        return args;
    }

    /**
     * Get a template variable from the Nunjucks context
     * @param {string} name - Variable name
     * @param {*} defaultValue - Default value if variable not found
     * @returns {*} Variable value or default
     */
    getVariable(name, defaultValue = null) {
        if (!this.nunjucksContext || !this.nunjucksContext.ctx) {
            return defaultValue;
        }

        return this.nunjucksContext.ctx[name] !== undefined ?
            this.nunjucksContext.ctx[name] : defaultValue;
    }

    /**
     * Set a template variable in the Nunjucks context
     * @param {string} name - Variable name
     * @param {*} value - Variable value
     */
    setVariable(name, value) {
        if (this.nunjucksContext && this.nunjucksContext.ctx) {
            this.nunjucksContext.ctx[name] = value;
        }
    }

    /**
     * Check if helper has access to Nunjucks context
     * @returns {boolean}
     */
    hasContext() {
        return this.nunjucksContext !== null;
    }

    /**
     * Set the Nunjucks context
     * @param {object} context - Nunjucks context object
     * @returns {AbstractHelper} For method chaining
     */
    setContext(context) {
        this.nunjucksContext = context;
        return this;
    }

    /**
     * Abstract render method that must be implemented by extending classes
     * @param {...any} args - Variable arguments passed to the render method
     * @throws {Error} If not implemented by extending class
     * @returns {string} Rendered output
     */
    render(...args) {
        throw new Error(`render() method must be implemented by ${this.constructor.name}`);
    }

}

module.exports = AbstractHelper;
