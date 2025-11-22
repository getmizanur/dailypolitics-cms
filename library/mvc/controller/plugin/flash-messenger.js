const Session = require(global.applicationPath('/library/session/session'));
const VarUtil
    = require(global.applicationPath('/library/util/var-util'));
const BasePlugin
    = require(
        global.applicationPath('/library/mvc/controller/base-plugin'));
const Container
    = require(global.applicationPath('/library/core/container'));


class FlashMessenger extends BasePlugin {

    constructor(options = {}) {
        super(options);

        this.namespace = options.namespace || 'FlashMessenger';
        this.messages = {
            default : [],
            success : [],
            warning : [],
            error : [],
            info : []
        };
        this.messageAdded = false;

        this.NAMESPACE_DEFAULT = 'default';
        this.NAMESPACE_SUCCESS = 'success';
        this.NAMESPACE_WARNING = 'warning';
        this.NAMESPACE_ERROR = 'error';
        this.NAMESPACE_INFO = 'info';

        // Use new session namespace instead of Container
        this.sessionNamespace = null;
        this.container = new Container(this.namespace); 
    }

    setNamespace(namespace = this.NAMESPACE_DEFAULT) {
        this.namespace = namespace;

        return this;
    }

    getNamespace() {
        return this.namespace;
    }

    getContainer() {
        if(this.container instanceof Container) {
            return this.container;
        }

        this.container = new Container('FlashMessenger');
        return this.container;
    }

    /**
     * Get session namespace for flash messages
     * @returns {SessionNamespace}
     */
    getSessionNamespace() {
        if (!this.sessionNamespace) {
            this.sessionNamespace = Session.getNamespace('FlashMessenger');
        }
        return this.sessionNamespace;
    }

    resetNamespace() {
        this.setNamespace();
        return this;
    }

    addMessage(message, namespace = this.NAMESPACE_DEFAULT) {
        try {
            // Use new session namespace system for better persistence
            const sessionNs = this.getSessionNamespace();
            let messages = sessionNs.get(namespace, []);

            // Ensure messages is an array
            if (!Array.isArray(messages)) {
                messages = [];
            }

            messages.push(message);
            sessionNs.set(namespace, messages);

            // Also update local messages for backward compatibility
            if (!this.messages[namespace]) {
                this.messages[namespace] = [];
            }
            this.messages[namespace].push(message);

            // Update container for backward compatibility
            this.container.set(namespace, this.messages[namespace]);

            if(this.messageAdded == false) {
                this.messageAdded = true;
            }

            // Immediately inject updated messages into template variables
            this._injectTemplateVariables();
        } catch (error) {
            console.warn('FlashMessenger addMessage error:', error.message);
            // Fallback to local storage
            if (!this.messages[namespace]) {
                this.messages[namespace] = [];
            }
            this.messages[namespace].push(message);
        }

        return this;
    }

    addInfoMessage(message) {
        this.addMessage(message, this.NAMESPACE_INFO);

        return this;
    }

    addSuccessMessage(message) {
        this.addMessage(message, this.NAMESPACE_SUCCESS);

        return this;
    }

    addWarningMessage(message) {
        this.addMessage(message, this.NAMESPACE_WARNING);

        return this;
    }

    addErrorMessage(message) {
        this.addMessage(message, this.NAMESPACE_ERROR);

        return this;
    }

    hasMessages(namespace = this.NAMESPACE_DEFAULT) {
        try {
            // Check session namespace first
            const sessionNs = this.getSessionNamespace();
            const sessionMessages = sessionNs.get(namespace, []);
            if (sessionMessages && sessionMessages.length > 0) {
                return true;
            }

            // Check container
            if (this.container.has(namespace)) {
                const containerMessages = this.container.get(namespace, []);
                if (containerMessages && containerMessages.length > 0) {
                    return true;
                }
            }

            // Check local messages
            return this.messages[namespace] && this.messages[namespace].length > 0;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get messages for a specific namespace
     * @param {string} namespace - Specific namespace to get messages from
     * @param {boolean} clearAfterRead - Whether to clear messages after reading (default: true for flash behavior)
     * @returns {Array} Messages for the specified namespace
     */
    getMessages(namespace = this.NAMESPACE_DEFAULT, clearAfterRead = true) {
        try {
            let messages = [];
            let foundMessages = false;

            // First try to get from session namespace (new system)
            const sessionNs = this.getSessionNamespace();
            const sessionMessages = sessionNs.get(namespace, []);
            
            if (sessionMessages && sessionMessages.length > 0) {
                messages = [...sessionMessages];
                foundMessages = true;
                // Clear messages after reading if clearAfterRead is true
                if (clearAfterRead) {
                    sessionNs.remove(namespace);
                }
            }

            // Fallback to container system
            if (!foundMessages && this.container.has(namespace)) {
                const containerMessages = this.container.get(namespace, []);
                if (containerMessages && containerMessages.length > 0) {
                    messages = [...containerMessages];
                    foundMessages = true;
                    // Clear container messages after reading if clearAfterRead is true
                    if (clearAfterRead) {
                        this.clearMessages(namespace);
                    }
                }
            }

            // Fallback to local messages array
            if (!foundMessages && this.messages[namespace] && this.messages[namespace].length > 0) {
                messages = [...this.messages[namespace]];
                foundMessages = true;
                // Clear local messages after reading if clearAfterRead is true
                if (clearAfterRead) {
                    this.messages[namespace] = [];
                }
            }

            // Clear from all storage locations if clearAfterRead is true
            if (foundMessages && clearAfterRead) {
                this._clearAllStorageForNamespace(namespace);
            }

            return messages;
        } catch (error) {
            console.warn('FlashMessenger getMessages error:', error.message);
            return [];
        }
    }

    /**
     * Get all messages organized by type - this is what controllers should use
     * @param {boolean} clearAfterRead - Whether to clear messages after reading
     * @returns {Object} Object containing arrays for each message type
     */
    getAllMessages(clearAfterRead = true) {
        return {
            errors: this.getMessages(this.NAMESPACE_ERROR, clearAfterRead),
            success: this.getMessages(this.NAMESPACE_SUCCESS, clearAfterRead),
            warnings: this.getMessages(this.NAMESPACE_WARNING, clearAfterRead),
            info: this.getMessages(this.NAMESPACE_INFO, clearAfterRead)
        };
    }

    /**
     * Helper method to clear messages from all storage locations for a namespace
     * @param {string} namespace 
     */
    _clearAllStorageForNamespace(namespace) {
        try {
            // Clear from session namespace
            const sessionNs = this.getSessionNamespace();
            if (sessionNs.has(namespace)) {
                sessionNs.remove(namespace);
            }

            // Clear from container
            if (this.container.has(namespace)) {
                // Use the existing clearMessages method or manually clear
                try {
                    // Set to empty array instead of undefined to avoid "no entry" errors
                    this.container.set(namespace, []);
                } catch (error) {
                    // Fallback if container doesn't support setting empty arrays
                    console.warn('Could not clear container namespace:', namespace);
                }
            }

            // Clear from local messages
            if (this.messages[namespace]) {
                this.messages[namespace] = [];
            }
        } catch (error) {
            console.warn('Error clearing all storage for namespace:', namespace, error.message);
        }
    }

    clearMessages(namespace) {
        if(VarUtil.isString(namespace) 
            || VarUtil.empty(namespace)) {
            namespace = this.getNamespace();
        }

        // Use the comprehensive clearing method
        this._clearAllStorageForNamespace(namespace);
        return true;
    }

    /**
     * Peek at messages without clearing them (for debugging/testing)
     * @param {string} namespace 
     * @returns {Array}
     */
    peekMessages(namespace = this.NAMESPACE_DEFAULT) {
        // Use the unified getMessages method with clearAfterRead = false
        return this.getMessages(namespace, false);
    }

    /**
     * Peek at all messages organized by type without clearing them
     * @returns {Object} Object containing arrays for each message type
     */
    peekAllMessages() {
        return this.getAllMessages(false);
    }

    /**
     * Clear all messages from all namespaces (useful for testing)
     */
    clearAllMessages() {
        try {
            // Clear session namespace
            const sessionNs = this.getSessionNamespace();
            sessionNs.clear();

            // Clear all local message namespaces
            Object.keys(this.messages).forEach(namespace => {
                this.messages[namespace] = [];
            });

            // Reset message added flag
            this.messageAdded = false;
        } catch (error) {
            console.warn('Error clearing all messages:', error.message);
        }
    }

    getMessagesFromContainer() {
        if(!VarUtil.empty(this.messages)
            || this.messageAdded) {
            return;
        }

        let container = this.getContainer();
    }

    /**
     * Auto-inject flash message arrays into template variables
     * This is called automatically when messages are added
     * Private method - use underscore prefix to indicate internal use
     */
    _injectTemplateVariables() {
        try {
            const controller = this.getController();
            if (!controller) {
                // Controller not set yet, skip injection
                return;
            }

            const view = controller.getView();
            if (!view || typeof view.setVariable !== 'function') {
                // View not ready yet, skip injection
                return;
            }

            // Get current messages from session without clearing
            const sessionNs = this.getSessionNamespace();

            // Inject each message type as a separate array variable
            view.setVariable('error_flash_messages', sessionNs.get(this.NAMESPACE_ERROR, []));
            view.setVariable('success_flash_messages', sessionNs.get(this.NAMESPACE_SUCCESS, []));
            view.setVariable('warning_flash_messages', sessionNs.get(this.NAMESPACE_WARNING, []));
            view.setVariable('info_flash_messages', sessionNs.get(this.NAMESPACE_INFO, []));
        } catch (error) {
            // Silently fail - template variables will just be empty arrays
            // This is expected during initialization or when controller isn't set
        }
    }

}

module.exports = FlashMessenger;
