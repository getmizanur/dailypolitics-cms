class Container {
    /**
     * Create a new session container (namespace)
     * @param {string} name - The name of the container/namespace
     * @param {object} session - The express-session req.session instance (optional)
     */
    constructor(name = 'Default', session = null) {
        this.name = name;
        this._expressSession = session;
        this._fallbackData = {}; // In-memory fallback storage
    }

    /**
     * Get the data object for this container from the session
     * Always accesses session directly (not cached) to ensure persistence
     * @returns {object}
     */
    _getData() {
        // First priority: Use express-session if provided directly
        if (this._expressSession) {
            if (!this._expressSession.customData) {
                this._expressSession.customData = {};
            }
            if (!this._expressSession.customData[this.name]) {
                this._expressSession.customData[this.name] = {};
            }
            return this._expressSession.customData[this.name];
        }

        // Second priority: Use express-session from global.locals
        if (typeof global !== 'undefined' && global.locals && global.locals.expressSession) {
            if (!global.locals.expressSession.customData) {
                global.locals.expressSession.customData = {};
            }
            if (!global.locals.expressSession.customData[this.name]) {
                global.locals.expressSession.customData[this.name] = {};
            }
            return global.locals.expressSession.customData[this.name];
        }

        // Fallback: Use in-memory storage (not persisted)
        return this._fallbackData;
    }

    /**
     * Set a value in the container
     * @param {string} key
     * @param {*} value
     */
    set(key, value) {
        const data = this._getData();
        data[key] = value;

        // Force express-session to detect modification by touching a top-level property
        // This is necessary because express-session with resave:false doesn't detect
        // deep nested object modifications automatically
        if (this._expressSession) {
            this._expressSession._modifiedAt = Date.now();
        }

        return this;
    }

    /**
     * Get a value from the container
     * @param {string} key
     * @param {*} defaultValue
     * @returns {*}
     */
    get(key, defaultValue = null) {
        const data = this._getData();
        return data.hasOwnProperty(key) ? data[key] : defaultValue;
    }

    /**
     * Check if a key exists in the container
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        const data = this._getData();
        return data.hasOwnProperty(key);
    }

    /**
     * Remove a key from the container
     * @param {string} key
     */
    remove(key) {
        const data = this._getData();
        if (data.hasOwnProperty(key)) {
            delete data[key];
        }

        // Touch session to force persistence
        if (this._expressSession) {
            this._expressSession._modifiedAt = Date.now();
        }

        return this;
    }

    /**
     * Get all data in the container
     * @returns {object}
     */
    all() {
        const data = this._getData();
        return { ...data };
    }

    /**
     * Clear all data in the container
     */
    clear() {
        const data = this._getData();
        Object.keys(data).forEach(key => delete data[key]);
        return this;
    }

    /**
     * Save the session to persistent storage
     * This is necessary when using express-session with resave:false
     * to ensure session data is persisted before redirects or other responses
     * @returns {Promise<void>}
     */
    async save() {
        if (this._expressSession && typeof this._expressSession.save === 'function') {
            return new Promise((resolve, reject) => {
                this._expressSession.save((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        }
        // No-op if no express session available
        return Promise.resolve();
    }
}

module.exports = Container;
