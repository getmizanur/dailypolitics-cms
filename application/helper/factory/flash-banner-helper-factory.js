const AbstractViewHelperFactory = require(global.applicationPath('/library/mvc/view/abstract-view-helper-factory'));
const FlashBannerHelper = require(global.applicationPath('/application/helper/flash-banner-helper'));

/**
 * FlashBannerHelperFactory
 * Factory for creating FlashBannerHelper with URL helper dependency injected
 */
class FlashBannerHelperFactory extends AbstractViewHelperFactory {

    /**
     * Create FlashBannerHelper with dependencies
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {FlashBannerHelper} FlashBannerHelper instance
     */
    createService(serviceManager) {
        // Create FlashBannerHelper instance
        const flashBannerHelper = new FlashBannerHelper();

        // Get ViewHelperManager from ServiceManager
        const viewHelperManager = serviceManager.get('ViewHelperManager');

        // Get URL helper from ViewHelperManager
        const urlHelper = viewHelperManager.get('url');

        // Inject URL helper into FlashBannerHelper
        flashBannerHelper.setUrlHelper(urlHelper);

        return flashBannerHelper;
    }

}

module.exports = FlashBannerHelperFactory;
