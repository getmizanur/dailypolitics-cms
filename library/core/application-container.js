/**
 * Container - Application environment registry
 *
 * Provides a clean interface to store and retrieve application-level objects
 * (configs, services, managers) from global.nunjucksEnv.globals.__framework namespace.
 *
 * This creates a clear separation between:
 * - global.nunjucksEnv = Nunjucks template engine environment
 * - global.nunjucksEnv.globals.__framework = Daily Politics application environment
 * - global.nunjucksEnv.globals[helperName] = Template helper functions (for convenience)
 *
 * Structure:
 *   global.nunjucksEnv.globals.__framework = {
 *     applicationConfig: {...},
 *     routesConfig: {...},
 *     ServiceManager: {
 *       configs: {
 *         invokables: {...},              // Application + Framework invokables
 *         factories: {...}                 // Application + Framework factories (merged)
 *       }
 *     },
 *     ViewManager: {
 *       configs: {
 *         display_not_found_reason: false,
 *         display_exceptions: false,
 *         doctype: "HTML5",
 *         not_found_template: "error/404",
 *         exception_template: "error/500",
 *         template_map: {},
 *         template_path_stack: []
 *       }
 *     },
 *     ViewHelperManager: {
 *       configs: {
 *         invokables: {...},              // Framework + Application helpers (merged)
 *         factories: {}
 *       },
 *       helpers: {                        // Runtime storage for helper-specific data
 *         headTitle: { titles: [] },
 *         headMeta: { metas: [] },
 *         headLink: { links: [] },
 *         headScript: { scripts: [] }
 *       }
 *     },
 *     PluginManager: {
 *       configs: {
 *         invokables: {...},              // Framework + Application plugins (merged)
 *         factories: {}
 *       }
 *     }
 *   }
 *
 * Usage:
 *   const container = new Container('__framework');
 *   container.set('applicationConfig', appConfig);
 *   container.set('ServiceManager', { configs: { invokables: {...}, factories: {...} } });
 *   container.set('ViewHelperManager', { configs: { invokables: {...}, factories: {} }, helpers: {} });
 */
class ApplicationContainer {

    constructor(namespace = '__framework') {
        this.namespace = namespace;
        this._ensureStorage();
    }

    /**
     * Ensure storage location exists
     * @private
     */
    _ensureStorage() {
        if (!global.nunjucksEnv || !global.nunjucksEnv.globals) {
            // Fallback to global.locals if nunjucksEnv not ready yet
            if (global.locals === undefined) {
                global.locals = {};
            }
            if (!global.locals.hasOwnProperty(this.namespace)) {
                global.locals[this.namespace] = {};
            }
        }
    }

    /**
     * Get the storage object for this namespace
     * @private
     * @returns {Object} The storage object
     */
    _getStorage() {
        // Prefer global.nunjucksEnv.globals if available
        if (global.nunjucksEnv && global.nunjucksEnv.globals) {
            if (!global.nunjucksEnv.globals[this.namespace]) {
                global.nunjucksEnv.globals[this.namespace] = {};
            }
            return global.nunjucksEnv.globals[this.namespace];
        }

        // Fallback to global.locals
        this._ensureStorage();
        return global.locals[this.namespace];
    }

    /**
     * Get the namespace
     * @returns {string} The namespace
     */
    getNamespace() {
        return this.namespace;
    }

    /**
     * Check if a key exists
     * @param {string} name - The key to check
     * @returns {boolean} True if key exists
     */
    has(name) {
        const storage = this._getStorage();
        return storage && storage.hasOwnProperty(name);
    }

    /**
     * Get a value
     * @param {string} name - The key to retrieve
     * @param {*} defaultValue - Default value if key not found
     * @returns {*} The stored value or defaultValue
     */
    get(name, defaultValue = null) {
        const storage = this._getStorage();

        if (!storage.hasOwnProperty(name)) {
            if (defaultValue !== null) {
                return defaultValue;
            }
            throw new Error(`No entry is registered for key ${name} in namespace ${this.namespace}`);
        }

        return storage[name];
    }

    /**
     * Set a value
     * @param {string} name - The key to store
     * @param {*} value - The value to store
     * @returns {ApplicationContainer} For method chaining
     */
    set(name, value) {
        const storage = this._getStorage();
        storage[name] = value;
        return this;
    }

    /**
     * Get all values in this namespace
     * @returns {Object} All stored values
     */
    all() {
        return { ...this._getStorage() };
    }

    /**
     * Get all keys in this namespace
     * @returns {Array} Array of keys
     */
    keys() {
        return Object.keys(this._getStorage());
    }

    /**
     * Remove a key
     * @param {string} name - The key to remove
     * @returns {boolean} True if key was removed
     */
    remove(name) {
        const storage = this._getStorage();
        if (storage.hasOwnProperty(name)) {
            delete storage[name];
            return true;
        }
        return false;
    }

    /**
     * Clear all values in this namespace
     * @returns {ApplicationContainer} For method chaining
     */
    clear() {
        const storage = this._getStorage();
        for (const key in storage) {
            if (storage.hasOwnProperty(key)) {
                delete storage[key];
            }
        }
        return this;
    }

    /**
     * Check if container storage is available
     * @returns {boolean} True if storage is available
     */
    isAvailable() {
        return !!(global.nunjucksEnv && global.nunjucksEnv.globals) || !!(global.locals);
    }

}

module.exports = ApplicationContainer;
