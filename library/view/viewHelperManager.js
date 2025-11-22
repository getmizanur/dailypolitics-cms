/**
 * ViewHelperManager - Manages framework and application view helpers
 *
 * This class follows the Zend Framework pattern of separating framework-level
 * helpers from application-specific helpers. Framework helpers are pre-registered
 * and protected from accidental modification by developers.
 */
class ViewHelperManager {

    constructor(applicationHelpers = {}) {
        // Validate application helpers don't override framework helpers
        const conflicts = this._checkConflicts(applicationHelpers);
        if (conflicts.length > 0) {
            throw new Error(`Application helpers cannot override framework helpers. Conflicts: ${conflicts.join(', ')}`);
        }

        this.applicationHelpers = applicationHelpers;
        this.instances = {}; // Cache for instantiated helpers

        // Framework-level helpers - protected from developer modification
        this.frameworkHelpers = {
            "form": {
                "class": "/library/view/helper/form",
                "params": []
            },
            "formButton": {
                "class": "/library/view/helper/formButton",
                "params": ["element"]
            },
            "formError": {
                "class": "/library/view/helper/formError",
                "params": ["element", "attributes = null"]
            },
            "formFile": {
                "class": "/library/view/helper/formFile",
                "params": ["element"]
            },
            "formHidden": {
                "class": "/library/view/helper/formHidden",
                "params": ["element"]
            },
            "formLabel": {
                "class": "/library/view/helper/formLabel",
                "params": ["elementOrAttribs", "labelContent = null"]
            },
            "formPassword": {
                "class": "/library/view/helper/formPassword",
                "params": ["element", "extraAttribs = {}"]
            },
            "formRadio": {
                "class": "/library/view/helper/formRadio",
                "params": ["element", "value = null"]
            },
            "formSubmit": {
                "class": "/library/view/helper/formSubmit",
                "params": ["element"]
            },
            "formText": {
                "class": "/library/view/helper/formText",
                "options": ["element", "extraAttribs = {}"]
            },
            "formTextarea": {
                "class": "/library/view/helper/formTextarea",
                "params": ["element", "extraAttribs = {}"]
            },
            "formSelect": {
                "class": "/library/view/helper/formSelect",
                "params": ["element", "extraAttribs = {}"]
            },
            "formCheckbox": {
                "class": "/library/view/helper/formCheckbox",
                "params": ["element", "extraAttribs = {}"]
            },
            "headTitle": {
                "class": "/library/view/helper/headTitle",
                "params": ["title = null", "mode = 'set'"]
            },
            "headMeta": {
                "class": "/library/view/helper/headMeta",
                "params": ["nameOrProperty = null", "content = null", "mode = 'add'"]
            },
            "headLink": {
                "class": "/library/view/helper/headLink",
                "params": ["attributes = null", "mode = 'add'"]
            },
            "headScript": {
                "class": "/library/view/helper/headScript",
                "params": ["scriptOrAttributes = null", "mode = 'append'", "attributes = {}"]
            },
            "formCsrf": {
                "class": "/library/view/helper/formCsrf",
                "params": ["element"]
            }
        };
    }

    /**
     * Get all helpers - merges framework helpers with application helpers
     * @param {Object} applicationHelpers - Custom helpers from application config
     * @returns {Object} Combined helpers object
     */
    getAllHelpers(applicationHelpers = {}) {
        // Framework helpers take precedence to prevent accidental override
        // But allow explicit override if developer really needs it
        return {
            ...this.frameworkHelpers,
            ...applicationHelpers
        };
    }

    /**
     * Get only framework helpers
     * @returns {Object} Framework helpers
     */
    getFrameworkHelpers() {
        return { ...this.frameworkHelpers };
    }

    /**
     * Check if a helper is a framework helper
     * @param {string} helperName - Name of the helper
     * @returns {boolean} True if framework helper
     */
    isFrameworkHelper(helperName) {
        return this.frameworkHelpers.hasOwnProperty(helperName);
    }

    /**
     * Get list of framework helper names
     * @returns {Array} Array of framework helper names
     */
    getFrameworkHelperNames() {
        return Object.keys(this.frameworkHelpers);
    }

    /**
     * Validate that application helpers don't accidentally override framework helpers
     * @param {Object} applicationHelpers - Application helpers to validate
     * @returns {Array} Array of conflicts (if any)
     */
    validateApplicationHelpers(applicationHelpers = {}) {
        const conflicts = [];
        Object.keys(applicationHelpers).forEach(helperName => {
            if (this.isFrameworkHelper(helperName)) {
                conflicts.push(helperName);
            }
        });
        return conflicts;
    }

    /**
     * Internal method to check for conflicts
     * @param {Object} applicationHelpers - Application helpers to check
     * @returns {Array} Array of conflicts
     */
    _checkConflicts(applicationHelpers) {
        const conflicts = [];
        Object.keys(applicationHelpers).forEach(helperName => {
            if (this.frameworkHelpers && this.frameworkHelpers.hasOwnProperty(helperName)) {
                conflicts.push(helperName);
            }
        });
        return conflicts;
    }

    /**
     * Get a helper instance by name
     * Instantiates the helper if not already cached
     * @param {string} name - Helper name
     * @returns {object} Helper instance
     */
    get(name) {
        // Return cached instance if available
        if (this.instances[name]) {
            return this.instances[name];
        }

        // Check framework helpers first
        if (this.frameworkHelpers[name]) {
            const helperConfig = this.frameworkHelpers[name];
            const HelperClass = require(global.applicationPath(helperConfig.class));
            const instance = new HelperClass();

            // Set nunjucks context if available
            if (global.nunjucksContext) {
                instance.setContext(global.nunjucksContext);
            }

            this.instances[name] = instance;
            return instance;
        }

        // Check application helpers
        if (this.applicationHelpers[name]) {
            const helperConfig = this.applicationHelpers[name];
            const HelperClass = require(global.applicationPath(helperConfig.class));
            const instance = new HelperClass();

            // Set nunjucks context if available
            if (global.nunjucksContext) {
                instance.setContext(global.nunjucksContext);
            }

            this.instances[name] = instance;
            return instance;
        }

        throw new Error(`Helper '${name}' not found in ViewHelperManager`);
    }

    /**
     * Check if a helper exists
     * @param {string} name - Helper name
     * @returns {boolean} True if helper exists
     */
    has(name) {
        return this.frameworkHelpers.hasOwnProperty(name) ||
               this.applicationHelpers.hasOwnProperty(name);
    }

    /**
     * Get all available helper names
     * @returns {Array} Array of helper names
     */
    getAvailableHelpers() {
        return [
            ...Object.keys(this.frameworkHelpers),
            ...Object.keys(this.applicationHelpers)
        ];
    }

}

module.exports = ViewHelperManager;