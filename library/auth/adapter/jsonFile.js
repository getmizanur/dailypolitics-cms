const fs = require('fs');
const path = require('path');

/**
 * JSON File Authentication Adapter
 * Authenticates against a JSON file containing user credentials
 * Following Zend Framework adapter pattern
 */
class JsonFile {
    constructor(filename, usernameColumn = 'username', passwordColumn = 'password') {
        this.filename = filename;
        this.usernameColumn = usernameColumn;
        this.passwordColumn = passwordColumn;
        this.username = null;
        this.password = null;
        this.resultInfo = {
            code: null,
            identity: null,
            messages: []
        };
    }

    /**
     * Set username for authentication
     * @param {string} username 
     * @returns {JsonFile}
     */
    setUsername(username) {
        this.username = username;
        return this;
    }

    /**
     * Set password for authentication
     * @param {string} password 
     * @returns {JsonFile}
     */
    setPassword(password) {
        this.password = password;
        return this;
    }

    /**
     * Set credentials for authentication
     * @param {string} username 
     * @param {string} password 
     * @returns {JsonFile}
     */
    setCredentials(username, password) {
        this.username = username;
        this.password = password;
        return this;
    }

    /**
     * Perform authentication
     * @returns {object} Authentication result
     */
    authenticate() {
        // Reset result info
        this.resultInfo = {
            code: null,
            identity: null,
            messages: []
        };

        // Validate input
        if (!this.username || !this.password) {
            this.resultInfo.code = 'FAILURE_CREDENTIAL_INVALID';
            this.resultInfo.messages.push('Username and password are required');
            return this.createResult();
        }

        try {
            // Read and parse JSON file
            if (!fs.existsSync(this.filename)) {
                this.resultInfo.code = 'FAILURE_UNCATEGORIZED';
                this.resultInfo.messages.push('User database file not found');
                return this.createResult();
            }

            const fileData = fs.readFileSync(this.filename, 'utf8');
            const users = JSON.parse(fileData);

            if (!Array.isArray(users)) {
                this.resultInfo.code = 'FAILURE_UNCATEGORIZED';
                this.resultInfo.messages.push('Invalid user database format');
                return this.createResult();
            }

            // Find user by username
            const user = users.find(u => u[this.usernameColumn] === this.username);

            if (!user) {
                this.resultInfo.code = 'FAILURE_IDENTITY_NOT_FOUND';
                this.resultInfo.messages.push('Username not found');
                return this.createResult();
            }

            // Verify password
            if (user[this.passwordColumn] !== this.password) {
                this.resultInfo.code = 'FAILURE_CREDENTIAL_INVALID';
                this.resultInfo.messages.push('Invalid password');
                return this.createResult();
            }

            // Authentication successful
            this.resultInfo.code = 'SUCCESS';
            this.resultInfo.identity = {
                id: user.id,
                username: user[this.usernameColumn],
                email: user.email || null,
                role: user.role || 'user'
            };
            this.resultInfo.messages.push('Authentication successful');

            return this.createResult();

        } catch (error) {
            console.error('JSON File Adapter error:', error);
            this.resultInfo.code = 'FAILURE_UNCATEGORIZED';
            this.resultInfo.messages.push('Authentication system error');
            return this.createResult();
        }
    }

    /**
     * Create authentication result object
     * @returns {object}
     */
    createResult() {
        const isValid = this.resultInfo.code === 'SUCCESS';
        
        return {
            _code: this.resultInfo.code,
            _isValid: isValid,
            _identity: this.resultInfo.identity,
            _messages: this.resultInfo.messages,
            
            getCode: function() { return this._code; },
            isValid: function() { return this._isValid; },
            getIdentity: function() { return this._identity; },
            getMessages: function() { return this._messages; }
        };
    }

    /**
     * Get the filename being used for authentication
     * @returns {string}
     */
    getFilename() {
        return this.filename;
    }

    /**
     * Get the username column name
     * @returns {string}
     */
    getUsernameColumn() {
        return this.usernameColumn;
    }

    /**
     * Get the password column name
     * @returns {string}
     */
    getPasswordColumn() {
        return this.passwordColumn;
    }
}

module.exports = JsonFile;