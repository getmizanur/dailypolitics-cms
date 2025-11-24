const AbstractFactory = require('../abstract-factory');
const ViewManager = require('../../mvc/view/view-manager');
const ApplicationContainer = require('../../core/application-container');

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

        // Check if configs already stored in Container
        const container = new ApplicationContainer('__framework');
        if (!container.has('ViewManager')) {
            // First time: store configs only
            container.set('ViewManager', {
                configs: viewManagerConfig
            });
        }

        return viewManager;
    }

}

module.exports = ViewManagerFactory;
