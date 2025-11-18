class Container {
    /**
     * Create a new session container (namespace)
     * @param {string} name - The name of the container/namespace
     * @param {object} session - The session instance (optional, for advanced use)
     */
    constructor(name = 'Default', session = null) {
        this.name = name;
        this._session = session;
        this._data = this._getData();
    }

    /**
     * Get the data object for this container from the session
     * @returns {object}
     */
    _getData() {
        if (this._session && this._session._sessionData) {
            if (!this._session._sessionData[this.name]) {
                this._session._sessionData[this.name] = {};
            }
            return this._session._sessionData[this.name];
        } else if (typeof global !== 'undefined' && global.locals && global.locals.session) {
            if (!global.locals.session.data) {
                global.locals.session.data = {};
            }
            if (!global.locals.session.data[this.name]) {
                global.locals.session.data[this.name] = {};
            }
            return global.locals.session.data[this.name];
        } else {
            if (!this._data) {
                this._data = {};
            }
            return this._data;
        }
    }

    /**
     * Set a value in the container
     * @param {string} key
     * @param {*} value
     */
    set(key, value) {
        this._data[key] = value;
        return this;
    }

    /**
     * Get a value from the container
     * @param {string} key
     * @param {*} defaultValue
     * @returns {*}
     */
    get(key, defaultValue = null) {
        return this._data.hasOwnProperty(key) ? this._data[key] : defaultValue;
    }

    /**
     * Check if a key exists in the container
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        return this._data.hasOwnProperty(key);
    }

    /**
     * Remove a key from the container
     * @param {string} key
     */
    remove(key) {
        if (this._data.hasOwnProperty(key)) {
            delete this._data[key];
        }
        return this;
    }

    /**
     * Get all data in the container
     * @returns {object}
     */
    all() {
        return { ...this._data };
    }

    /**
     * Clear all data in the container
     */
    clear() {
        Object.keys(this._data).forEach(key => delete this._data[key]);
        return this;
    }
}

module.exports = Container;
