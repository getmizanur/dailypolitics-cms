const AbstractFactory = require('../abstractFactory');
const ViewManager = require('../../view/viewManager');

class ViewManagerFactory extends AbstractFactory {

    /**
     * Create ViewManager service
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {ViewManager} ViewManager instance
     */
    createService(serviceManager) {
        // Get view_manager configuration from application config
        let viewManagerConfig = {};

        try {
            const controller = serviceManager.getController();
            const container = controller.getConfig();
            const appConfig = container.get('application');
            viewManagerConfig = appConfig.view_manager || {};
        } catch (error) {
            console.warn('Could not load view_manager config:', error.message);
        }

        return new ViewManager(viewManagerConfig);
    }

}

module.exports = ViewManagerFactory;
