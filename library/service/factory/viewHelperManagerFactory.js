const AbstractFactory = require('../abstractFactory');
const ViewHelperManager = require('../../view/viewHelperManager');
const Container = require('../../container');

class ViewHelperManagerFactory extends AbstractFactory {

    /**
     * Create ViewHelperManager service
     * Structure: global.nunjucksEnv.globals.__framework.ViewHelperManager.configs
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {ViewHelperManager} ViewHelperManager instance
     */
    createService(serviceManager) {
        // Always create new instance (configs stored in Container, not instance)
        let applicationHelpers = {};

        try {
            const controller = serviceManager.getController();
            const configRegistry = controller.getConfig();
            const appConfig = configRegistry.get('application');

            // Get invokables from view_helpers config
            if (appConfig.view_helpers && appConfig.view_helpers.invokables) {
                applicationHelpers = appConfig.view_helpers.invokables;
            }
        } catch (error) {
            console.warn('Could not load view_helpers config:', error.message);
        }

        const viewHelperManager = new ViewHelperManager(applicationHelpers);

        // Check if configs already stored in Container
        const container = new Container('__framework');
        if (!container.has('ViewHelperManager')) {
            // First time: merge and store configs
            // Merge framework helpers with application helpers (with conflict check)
            const mergedHelpers = this._mergeHelpers(
                viewHelperManager.frameworkHelpers,
                applicationHelpers
            );

            // Store configs in container (no instance, no separate framework/application)
            container.set('ViewHelperManager', {
                configs: {
                    invokables: mergedHelpers,
                    factories: {}  // Helpers currently don't have factories, but structure matches ServiceManager
                },
                helpers: {}  // Runtime storage for helper-specific data (titles, meta tags, links, scripts)
            });
        }

        return viewHelperManager;
    }

    /**
     * Merge framework helpers with application helpers
     * Throws error if application tries to override framework helper
     * @private
     */
    _mergeHelpers(frameworkHelpers, applicationHelpers) {
        // Check for conflicts
        const conflicts = Object.keys(applicationHelpers).filter(key =>
            frameworkHelpers.hasOwnProperty(key)
        );

        if (conflicts.length > 0) {
            throw new Error(
                `Application helpers cannot override framework helpers. ` +
                `The following keys are already in use by the framework: ${conflicts.join(', ')}. ` +
                `Please choose different names for your application helpers.`
            );
        }

        // Merge: framework helpers first, then application helpers
        return {
            ...frameworkHelpers,
            ...applicationHelpers
        };
    }

}

module.exports = ViewHelperManagerFactory;
