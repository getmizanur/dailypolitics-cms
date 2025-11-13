class PluginManager {

    constructor(options = {}) {
        this.controller = options.controller || null;
        this.config = options.config || null;

        this.plugins = {};

        // Framework plugins that should not be modified by developers
        this.frameworkPlugins = {
            "flashMessenger": {
                "class": "/library/mvc/controller/plugin/flashMessenger",
                "description": "Flash messaging system for user notifications"
            },
            "layout": {
                "class": "/library/mvc/controller/plugin/layout",
                "description": "Template and layout management"
            },
            "params": {
                "class": "/library/mvc/controller/plugin/params",
                "description": "Parameter handling utilities"
            },
            "redirect": {
                "class": "/library/mvc/controller/plugin/redirect",
                "description": "HTTP redirect functionality"
            },
            "url": {
                "class": "/library/mvc/controller/plugin/url",
                "description": "URL generation and routing utilities"
            },
            "session": {
                "class": "/library/mvc/controller/plugin/session",
                "description": "Session management plugin"
            }
        };

        // Load application plugins from configuration
        this.invokableClasses = this.getAllPlugins();
    }

    /**
     * Set application configuration
     * @param {Object} config Application configuration
     */
    setConfig(config) {
        this.config = config;
        // Reload plugins when config is set
        this.invokableClasses = this.getAllPlugins();
        return this;
    }

    /**
     * Get all plugins (framework + application) merged together
     * Framework plugins take precedence over application plugins with same name
     * @returns {Object} Combined plugin configuration object
     */
    getAllPlugins() {
        // Start with framework plugins
        let allPlugins = { ...this.frameworkPlugins };
        
        // Add application plugins from config
        const applicationPlugins = this.loadApplicationPluginsFromConfig();
        
        // Warn about conflicts and merge
        this.validateApplicationPlugins(applicationPlugins);
        Object.assign(allPlugins, applicationPlugins);
        
        return allPlugins;
    }

    /**
     * Load application controller plugins from configuration only
     * @returns {Object} Application plugin configuration object
     */
    loadApplicationPluginsFromConfig() {
        try {
            if (!this.config) {
                return {};
            }

            const controllerPlugins = this.config?.controller_plugins?.invokables || {};
            
            // Convert config format to internal format
            const plugins = {};
            Object.entries(controllerPlugins).forEach(([pluginName, pluginConfig]) => {
                // Handle both old string format and new object format
                const pluginClass = typeof pluginConfig === 'string' ? pluginConfig : pluginConfig.class;
                const pluginDescription = typeof pluginConfig === 'object' ? pluginConfig.description : 'Custom application plugin';
                
                plugins[pluginName] = {
                    class: pluginClass,
                    description: pluginDescription
                };
            });

            return plugins;
        } catch (error) {
            console.warn('Could not load application controller plugins from config:', error.message);
            return {};
        }
    }

    /**
     * Validate application plugins and warn about conflicts with framework plugins
     * @param {Object} applicationPlugins Application plugin configuration
     */
    validateApplicationPlugins(applicationPlugins) {
        const conflicts = Object.keys(applicationPlugins).filter(name => 
            this.frameworkPlugins.hasOwnProperty(name)
        );
        
        if (conflicts.length > 0) {
            console.warn(`Warning: Application plugins override framework plugins: ${conflicts.join(', ')}`);
        }
    }

    setController(controller) {
        //if(!(controller instanceof BaseController)) {
        //    throw new Error('The class is not a BaseController instance.');
        //}

        this.controller = controller;

        return this;
    }

    getController() {
        return this.controller;
    }

    get(name, options = {}) {
        if(!this.invokableClasses.hasOwnProperty(name)) {
            console.warn(`Controller plugin '${name}' not found in configuration`);
            return null;
        }

        if(this.plugins[name] == undefined) {
            try {
                const pluginConfig = this.invokableClasses[name];
                const pluginPath = typeof pluginConfig === 'string' ? pluginConfig : pluginConfig.class;
                
                // Use global.applicationPath for absolute paths, otherwise relative require
                const requirePath = pluginPath.startsWith('/') ? 
                    global.applicationPath(pluginPath) : 
                    pluginPath;
                
                const Instance = require(requirePath);
                let plugin = new Instance(options);
                plugin.setController(this.getController());

                this.plugins[name] = plugin;
            } catch (error) {
                console.error(`Error loading controller plugin '${name}':`, error.message);
                return null;
            }
        }

        return this.plugins[name];
    }

    /**
     * Get list of available plugins
     * @returns {Array} Array of plugin names
     */
    getAvailablePlugins() {
        return Object.keys(this.invokableClasses);
    }

    /**
     * Check if plugin is available
     * @param {string} name Plugin name
     * @returns {boolean}
     */
    hasPlugin(name) {
        return this.invokableClasses.hasOwnProperty(name);
    }

    /**
     * Get plugin configuration info
     * @param {string} name Plugin name  
     * @returns {Object|null} Plugin configuration or null
     */
    getPluginInfo(name) {
        const pluginConfig = this.invokableClasses[name];
        if (!pluginConfig) {
            return null;
        }

        return {
            name: name,
            class: typeof pluginConfig === 'string' ? pluginConfig : pluginConfig.class,
            description: typeof pluginConfig === 'object' ? pluginConfig.description : 'No description available'
        };
    }

}

module.exports = PluginManager;
