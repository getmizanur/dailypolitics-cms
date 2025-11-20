const AbstractFactory = require('../abstractFactory');
const ViewHelperManager = require('../../view/viewHelperManager');

class ViewHelperManagerFactory extends AbstractFactory {

    /**
     * Create ViewHelperManager service
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {ViewHelperManager} ViewHelperManager instance
     */
    createService(serviceManager) {
        return new ViewHelperManager();
    }

}

module.exports = ViewHelperManagerFactory;
