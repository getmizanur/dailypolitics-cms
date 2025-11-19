/**
 * ViewHelperManager - Manages framework and application view helpers
 * 
 * This class follows the Zend Framework pattern of separating framework-level
 * helpers from application-specific helpers. Framework helpers are pre-registered
 * and protected from accidental modification by developers.
 */
class ViewHelperManager {

    constructor() {
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
                "params": ["element"]
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

}

module.exports = ViewHelperManager;