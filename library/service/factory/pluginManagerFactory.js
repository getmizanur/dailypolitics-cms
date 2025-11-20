const AbstractFactory = require('../abstractFactory');
const PluginManager = require('../../controller/pluginManager');

class PluginManagerFactory extends AbstractFactory {

    /**
     * Create PluginManager service
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {PluginManager} PluginManager instance
     */
    createService(serviceManager) {
        const pluginManager = new PluginManager();

        // Pass configuration to plugin manager if available
        try {
            const controller = serviceManager.getController();
            const container = controller.getConfig();
            const appConfig = container.get('application');
            pluginManager.setConfig(appConfig);
        } catch (error) {
            console.warn('Could not load application config for plugin manager:', error.message);
        }

        return pluginManager;
    }

}

module.exports = PluginManagerFactory;
