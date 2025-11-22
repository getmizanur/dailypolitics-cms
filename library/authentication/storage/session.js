// library/authentication/storage/session.js
// Session-based storage for authentication identity using generic SessionContainer

const SessionContainer = require('../../session/container');

/**
 * Session Storage
 * Stores authentication identity in session using the generic SessionContainer
 * This is a specialized adapter that provides authentication-specific interface
 * while delegating storage to the reusable SessionContainer class
 */
class Session {
    /**
     * Session namespace for authentication
     * @type {string}
     */
    static NAMESPACE = 'AuthIdentity';

    /**
     * Key for storing identity data within the namespace
     * @type {string}
     */
    static IDENTITY_KEY = 'identity';

    /**
     * Constructor
     * @param {Object} session - Express-session req.session instance (optional)
     */
    constructor(session = null) {
        // Use SessionContainer for actual storage management
        // If session not provided, Container will use global.locals.expressSession
        /** @type {SessionContainer} */
        this.container = new SessionContainer(Session.NAMESPACE, session);
    }

    /**
     * Returns true if and only if storage is empty
     * @returns {boolean}
     */
    isEmpty() {
        return !this.container.has(Session.IDENTITY_KEY);
    }

    /**
     * Returns the contents of storage
     * @returns {*|null}
     */
    read() {
        return this.container.get(Session.IDENTITY_KEY, null);
    }

    /**
     * Writes contents to storage
     * @param {*} contents - Data to store
     */
    write(contents) {
        this.container.set(Session.IDENTITY_KEY, contents);
    }

    /**
     * Clears contents from storage
     */
    clear() {
        this.container.remove(Session.IDENTITY_KEY);
    }
}

module.exports = Session;
