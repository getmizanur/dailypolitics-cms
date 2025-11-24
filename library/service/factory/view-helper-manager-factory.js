const AbstractFactory = require('../abstract-factory');
const ViewHelperManager = require('../../mvc/view/view-helper-manager');
const Container = require('../../core/container');

class ViewHelperManagerFactory extends AbstractFactory {

    /**
     * Create ViewHelperManager service
     * Structure: global.nunjucksEnv.globals.__framework.ViewHelperManager.configs
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {ViewHelperManager} ViewHelperManager instance
     */
    createService(serviceManager) {
        // Always create new instance (configs stored in Container, not instance)
        let applicationHelpersConfig = {
            invokables: {},
            factories: {}
        };

        try {
            //const configRegistry = serviceManager.get('config');
            //const appConfig = configRegistry.get('application');
            //const configRegistry = serviceManager.get('config');
            const appConfig = serviceManager.get('config');

            // Get invokables and factories from view_helpers config
            if (appConfig.view_helpers) {
                if (appConfig.view_helpers.invokables) {
                    applicationHelpersConfig.invokables = appConfig.view_helpers.invokables;
                }
                if (appConfig.view_helpers.factories) {
                    applicationHelpersConfig.factories = appConfig.view_helpers.factories;
                }
            }
        } catch (error) {
            console.warn('Could not load view_helpers config:', error.message);
        }

        const viewHelperManager = new ViewHelperManager(applicationHelpersConfig, serviceManager);

        // Check if configs already stored in Container
        const container = new Container('__framework');
        if (!container.has('ViewHelperManager')) {
            // First time: merge and store configs
            // Merge framework helpers with application helpers (with conflict check)
            const mergedHelpers = this._mergeHelpers(
                viewHelperManager.frameworkHelpers,
                applicationHelpersConfig.invokables
            );

            // Store configs in container (no instance, no separate framework/application)
            container.set('ViewHelperManager', {
                configs: {
                    invokables: mergedHelpers,
                    factories: applicationHelpersConfig.factories || {}
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
