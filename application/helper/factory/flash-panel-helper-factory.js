const AbstractViewHelperFactory = require(
    global.applicationPath(
        '/library/mvc/view/abstract-view-helper-factory'));
const FlashPanelHelper = require(
    global.applicationPath('/application/helper/flash-panel-helper'));

/**
 * FlashPanelHelperFactory - Factory for creating FlashPanelHelper
 * Creates FlashPanelHelper instance for rendering confirmation panels
 * No dependencies required - FlashPanelHelper is self-contained
 * @extends AbstractViewHelperFactory
 */
class FlashPanelHelperFactory extends AbstractViewHelperFactory {

    /**
     * Create FlashPanelHelper instance
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {FlashPanelHelper} FlashPanelHelper instance
     */
    createService(serviceManager) {
        // Create and return FlashPanelHelper instance
        // No dependencies to inject
        const flashPanelHelper = new FlashPanelHelper();

        return flashPanelHelper;
    }

}

module.exports = FlashPanelHelperFactory;
