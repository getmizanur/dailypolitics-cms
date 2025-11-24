const AbstractFactory = require('../abstract-factory');
const PluginManager = require('../../mvc/controller/plugin-manager');
const Container = require('../../core/container');

class PluginManagerFactory extends AbstractFactory {

    /**
     * Create PluginManager service
     * Structure: global.nunjucksEnv.globals.__framework.PluginManager.configs
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {PluginManager} PluginManager instance
     */
    createService(serviceManager) {
        // Always create new instance (configs stored in Container, not instance)
        const pluginManager = new PluginManager();

        // Pass configuration to plugin manager if available
        let appConfig = null;
        try {
            //const configRegistry = serviceManager.get('config');
            //appConfig = configRegistry.get('application');
            appConfig = serviceManager.get('config');

            pluginManager.setConfig(appConfig);
        } catch (error) {
            console.warn('Could not load application config for plugin manager:', error.message);
        }

        // Check if configs already stored in Container
        const container = new Container('__framework');
        if (!container.has('PluginManager')) {
            // First time: merge and store configs
            const applicationPlugins = appConfig?.controller_plugins?.invokables || {};

            // Merge framework plugins with application plugins (with conflict check)
            const mergedPlugins = this._mergePlugins(
                pluginManager.frameworkPlugins,
                applicationPlugins
            );

            // Store configs in container (no instance, no separate framework/application)
            container.set('PluginManager', {
                configs: {
                    invokables: mergedPlugins,
                    factories: {}  // Plugins currently don't have factories, but structure matches ServiceManager
                }
            });
        }

        return pluginManager;
    }

    /**
     * Merge framework plugins with application plugins
     * Throws error if application tries to override framework plugin
     * @private
     */
    _mergePlugins(frameworkPlugins, applicationPlugins) {
        // Check for conflicts
        const conflicts = Object.keys(applicationPlugins).filter(key =>
            frameworkPlugins.hasOwnProperty(key)
        );

        if (conflicts.length > 0) {
            throw new Error(
                `Application plugins cannot override framework plugins. ` +
                `The following keys are already in use by the framework: ${conflicts.join(', ')}. ` +
                `Please choose different names for your application plugins.`
            );
        }

        // Merge: framework plugins first, then application plugins
        return {
            ...frameworkPlugins,
            ...applicationPlugins
        };
    }

}

module.exports = PluginManagerFactory;
