const Session = require('../session/session');

/**
 * Authentication Service
 * Based on Zend Framework authentication pattern
 * Manages authentication state and delegates credential verification to adapters
 */
class Authentication {
    constructor() {
        this.adapter = null;
        this.identity = null;
        this.isValid = false;
        this.messages = [];
    }

    /**
     * Set authentication adapter
     * @param {object} adapter Authentication adapter instance
     */
    setAdapter(adapter) {
        this.adapter = adapter;
        return this;
    }

    /**
     * Get authentication adapter
     * @returns {object|null}
     */
    getAdapter() {
        return this.adapter;
    }

    /**
     * Authenticate using the configured adapter
     * @returns {object} Authentication result
     */
    authenticate() {
        if (!this.adapter) {
            throw new Error('Authentication adapter must be set before authenticating');
        }

        try {
            const result = this.adapter.authenticate();
            
            if (result.isValid()) {
                // Authentication successful
                this.identity = result.getIdentity();
                this.isValid = true;
                this.messages = result.getMessages();
                
                // Store identity in session
                Session.set('auth_identity', this.identity);
                Session.set('auth_valid', true);
            } else {
                // Authentication failed
                this.clearIdentity();
                this.messages = result.getMessages();
            }
            
            return result;
        } catch (error) {
            console.error('Authentication error:', error);
            this.clearIdentity();
            this.messages = ['Authentication system error'];
            return this.createResult(false, null, this.messages);
        }
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    hasIdentity() {
        // Check session first
        const sessionIdentity = Session.get('auth_identity');
        const sessionValid = Session.get('auth_valid');
        
        if (sessionIdentity && sessionValid) {
            this.identity = sessionIdentity;
            this.isValid = true;
            return true;
        }
        
        return this.isValid && this.identity !== null;
    }

    /**
     * Get authenticated user identity
     * @returns {object|null}
     */
    getIdentity() {
        if (this.hasIdentity()) {
            return this.identity;
        }
        return null;
    }

    /**
     * Clear authentication (logout)
     */
    clearIdentity() {
        this.identity = null;
        this.isValid = false;
        this.messages = [];
        
        // Clear from session
        Session.remove('auth_identity');
        Session.remove('auth_valid');
    }

    /**
     * Get authentication result messages
     * @returns {array}
     */
    getMessages() {
        return this.messages || [];
    }

    /**
     * Create authentication result object
     * @param {boolean} valid 
     * @param {object|null} identity 
     * @param {array} messages 
     * @returns {object}
     */
    createResult(valid, identity, messages = []) {
        return {
            _isValid: valid,
            _identity: identity,
            _messages: messages,
            isValid: function() { return this._isValid; },
            getIdentity: function() { return this._identity; },
            getMessages: function() { return this._messages; }
        };
    }
}

module.exports = Authentication;