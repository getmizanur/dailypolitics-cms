const AbstractFactory = require('../abstract-factory');
const ViewManager = require('../../mvc/view/view-manager');


class ViewManagerFactory extends AbstractFactory {

    /**
     * Create ViewManager service
     * Structure: global.nunjucksEnv.globals.__framework.ViewManager.configs
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {ViewManager} ViewManager instance
     */
    createService(serviceManager) {
        // Always create new instance (configs stored in Container, not instance)
        let viewManagerConfig = {};

        try {
            const configRegistry = serviceManager.get('config');
            const appConfig = configRegistry.get('application');
            viewManagerConfig = appConfig.view_manager || {};
        } catch (error) {
            console.warn('Could not load view_manager config:', error.message);
        }

        const viewManager = new ViewManager(viewManagerConfig);

        // Get config from ServiceManager
        const config = serviceManager.get('config');
        if (config && config.view_manager) {
            // Merge configs if needed, or just rely on what's passed
            // In this architecture, we assume config is already merged in ServiceManager
        }

        return viewManager;
    }

}

module.exports = ViewManagerFactory;
