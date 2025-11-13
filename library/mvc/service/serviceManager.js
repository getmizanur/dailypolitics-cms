const StringUtil = require('../util/stringUtil');
const ErrorResponse = require('../util/errorResponse');
const AbstractFactory = require('./abstractFactory');

class ServiceManager {

    constructor(options = {}) {
        this.controller = options.controller || null;

        this.services = {};
        this.invokables = null;
        this.factories = null;
    }

    setController(controller) {
        this.controller = controller;

        return this;
    }

    getController() {
        return this.controller;
    }

    get(name) {
        // Lazy load configuration
        if (this.invokables == null || this.factories == null) {
            this.loadConfiguration();
        }
        
        // Return cached service if exists
        if (this.services[name]) {
            return this.services[name];
        }
        
        // Try factories first (higher priority)
        if (this.factories.hasOwnProperty(name)) {
            return this.createFromFactory(name);
        }
        
        // Fall back to invokables (direct instantiation)
        if (this.invokables.hasOwnProperty(name)) {
            return this.createFromInvokable(name);
        }
        
        throw new Error(`Service '${name}' not found in service manager`);
    }

    /**
     * Load service configuration from application config
     */
    loadConfiguration() {
        let configObj = this.getController().getConfig();
        let applicationObj = configObj.get('application');
        let serviceManagerObj = applicationObj.service_manager || {};
        
        this.invokables = serviceManagerObj.invokables || {};
        this.factories = serviceManagerObj.factories || {};
    }

    /**
     * Create service using factory pattern
     * @param {string} name - Service name
     * @returns {Object} - Service instance
     */
    createFromFactory(name) {
        try {
            let factoryPath = global.applicationPath(this.factories[name]);
            let FactoryClass = require(factoryPath);
            
            // Validate factory extends AbstractFactory
            if (!this.isValidFactory(FactoryClass)) {
                throw new Error(`Factory '${factoryPath}' must extend AbstractFactory`);
            }
            
            // Create factory instance
            let factory = new FactoryClass();
            
            // Validate configuration if factory supports it
            if (typeof factory.validateConfiguration === 'function' || 
                typeof factory.validateRequiredConfig === 'function') {
                let configObj = this.getController().getConfig();
                
                // Check required configuration keys first
                if (typeof factory.validateRequiredConfig === 'function' && 
                    !factory.validateRequiredConfig(configObj)) {
                    throw new Error(`Required configuration validation failed for factory '${factoryPath}'`);
                }
                
                // Then run custom validation
                if (typeof factory.validateConfiguration === 'function' && 
                    !factory.validateConfiguration(configObj)) {
                    throw new Error(`Configuration validation failed for factory '${factoryPath}'`);
                }
            }
            
            // Create service through factory
            this.services[name] = factory.createService(this);
            
            console.log(`Service '${name}' created via factory: ${factoryPath}`);
            return this.services[name];
            
        } catch (error) {
            throw new Error(`Failed to create service '${name}' via factory: ${error.message}`);
        }
    }

    /**
     * Create service using direct instantiation
     * @param {string} name - Service name
     * @returns {Object} - Service instance
     */
    createFromInvokable(name) {
        try {
            let path = global.applicationPath(this.invokables[name]);
            let ServiceClass = require(path);
            
            this.services[name] = new ServiceClass();
            
            console.log(`Service '${name}' created via invokable: ${path}`);
            return this.services[name];
            
        } catch (error) {
            throw new Error(`Failed to create service '${name}' via invokable: ${error.message}`);
        }
    }

    /**
     * Validate if factory class extends AbstractFactory
     * @param {Function} FactoryClass - Factory constructor
     * @returns {boolean}
     */
    isValidFactory(FactoryClass) {
        // Check if class has static method indicating abstract factory implementation
        if (typeof FactoryClass.implementsAbstractFactory === 'function' && 
            FactoryClass.implementsAbstractFactory()) {
            
            // Additional check: ensure createService method exists
            let instance;
            try {
                instance = new FactoryClass();
            } catch (error) {
                console.warn(`Cannot instantiate factory class: ${error.message}`);
                return false;
            }
            
            if (typeof instance.createService !== 'function') {
                console.warn('Factory class missing createService method');
                return false;
            }
            
            return true;
        }
        
        // Check if instance extends AbstractFactory
        try {
            let instance = new FactoryClass();
            const isValid = instance instanceof AbstractFactory;
            
            if (!isValid) {
                console.warn('Factory class must extend AbstractFactory');
            }
            
            return isValid;
        } catch (error) {
            console.warn(`Factory validation error: ${error.message}`);
            return false;
        }
    }

    /**
     * Check if service exists in configuration
     * @param {string} name - Service name
     * @returns {boolean}
     */
    has(name) {
        if (this.invokables == null || this.factories == null) {
            this.loadConfiguration();
        }
        
        return this.factories.hasOwnProperty(name) || 
               this.invokables.hasOwnProperty(name);
    }

    /**
     * Get all available service names
     * @returns {Array} - Array of service names
     */
    getAvailableServices() {
        if (this.invokables == null || this.factories == null) {
            this.loadConfiguration();
        }
        
        return [
            ...Object.keys(this.factories),
            ...Object.keys(this.invokables)
        ];
    }

    /**
     * Clear cached service instance
     * @param {string} name - Service name
     * @returns {ServiceManager}
     */
    clearService(name) {
        if (this.services[name]) {
            delete this.services[name];
        }
        return this;
    }

    /**
     * Clear all cached services
     * @returns {ServiceManager}
     */
    clearAllServices() {
        this.services = {};
        return this;
    }

    getClass() {
        return this.constructor.name;
    }

}

module.exports = ServiceManager;
