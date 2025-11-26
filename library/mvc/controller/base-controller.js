const StringUtil = require('../../util/string-util');
const ViewModel = require('../view/view-model');
const ServiceManager = require('../../service/service-manager');


class BaseController {

    constructor(options = {}) {
        this.container = options.container || null;
        this.serviceLocator = options.serviceLocator || null;

        this.request = options.req || null;
        this.response = options.res || null;
        this.method = null;

        this.moduleName = null;
        this.controllerName = null;
        this.actionName = null;

        this.model = null;

        this.delimiter = null;

        this.pluginManager = null;
        this.returnResponse = null;
        this.dispatched = false;
        this.view = null;
    }

    setServiceLocator(serviceLocator) {
        this.serviceLocator = serviceLocator;
        this.serviceLocator.setController(this);

        return this;
    }

    getServiceManager() {
        if (!this.serviceLocator) {
            // Always create new instance (configs stored in Container, not instance)
            const serviceManager = new ServiceManager();
            this.setServiceLocator(serviceManager);

            // Load configuration
            serviceManager.loadConfiguration();

            // Merge framework factories with application factories (with conflict check)
            const mergedFactories = this._mergeFactories(
                serviceManager.frameworkFactories,
                serviceManager.factories || {}
            );

            // Update service manager with merged factories
            serviceManager.factories = mergedFactories;
        }

        return this.serviceLocator;
    }

    /**
     * Merge framework factories with application factories
     * Throws error if application tries to override framework factory
     * @private
     */
    _mergeFactories(frameworkFactories, applicationFactories) {
        // Check for conflicts
        const conflicts = Object.keys(applicationFactories).filter(key =>
            frameworkFactories.hasOwnProperty(key)
        );

        if (conflicts.length > 0) {
            throw new Error(
                `Application factories cannot override framework factories. ` +
                `The following keys are already in use by the framework: ${conflicts.join(', ')}. ` +
                `Please choose different names for your application factories.`
            );
        }

        // Merge: framework factories first, then application factories
        return {
            ...frameworkFactories,
            ...applicationFactories
        };
    }

    // Backward compatibility alias - deprecated, use getServiceManager() instead
    getServiceLocator() {
        console.warn('getServiceLocator() is deprecated, use getServiceManager() instead');
        return this.getServiceManager();
    }

    getConfig() {
        return this.container;
    }

    setConfig(container) {
        this.config = container;
    }

    getRequest() {
        return this.request;
    }

    setRequest(req) {
        this.request = req;
    }

    getResponse() {
        return this.response;
    }

    setResponse(res) {
        this.response = res;
    }

    getSession() {
        if (!this.request) {
            throw new Error('Request object not available');
        }
        return this.request.session;
    }

    setSession(session) {
        if (!this.request) {
            throw new Error('Request object not available');
        }
        this.request.session = session;
        return this;
    }

    setView(viewModel) {
        this.model = viewModel;
    }

    getView() {
        if (this.model == null) {
            this.model = new ViewModel();
            this.model.setTemplate(this.getViewScript());
        }
        return this.model;
    }

    getViewScript() {
        return this.plugin('layout').getTemplate();
    }

    getParam(name, defaultValue = null) {
        let value = this.getRequest().getParam(name, defaultValue);

        return value;
    }

    getAllParams() {
        return this.getRequest().getParams();
    }

    getQuery(name, defaultValue = null) {
        let value = this.getRequest().getQuery(name, defaultValue);

        return value;
    }

    returnResponse() {
        return this.returnResponse;
    }

    /**
     * Central hook to prepare flash messages before rendering.
     * Call this once per request, e.g. at the end of your main dispatch method,
     * just before you render the view.
     */
    prepareFlashMessenger() {
        try {
            const flash = this.plugin('flashMessenger');
            if (flash && typeof flash.prepareForView === 'function') {
                flash.prepareForView();
            }
        } catch (e) {
            // swallow – no flash messages is fine
        }
    }

    dispatch(request = null, response = null) {
        let view = null;

        if (request != null) {
            this.setRequest(request);
        } else {
            request = this.getRequest();
        }

        if (response != null) {
            this.setResponse(response);
        } else {
            response = this.getResponse();
        }

        // Set module and controller metadata as template variables (before preDispatch to ensure availability)
        const viewModel = this.getView();
        if (viewModel && request) {
            // Set module name (from route)
            if (typeof request.getModuleName === 'function') {
                viewModel.setVariable('_moduleName', request.getModuleName());
            }

            // Set controller name (from route)
            if (typeof request.getControllerName === 'function') {
                viewModel.setVariable('_controllerName', request.getControllerName());
            }

            // Set action name (from route)
            if (typeof request.getActionName === 'function') {
                let action = request.getActionName();
                viewModel.setVariable('_actionName', StringUtil.toKebabCase(action).replace('-action', ''));
            }

            // Set route name for convenience
            if (typeof request.getRouteName === 'function') {
                viewModel.setVariable('_routeName', request.getRouteName());
            }

            // Set authentication status for navigation helpers
            try {
                const authService = this.getServiceManager().get('AuthenticationService');
                const isAuthenticated = authService && authService.hasIdentity();
                viewModel.setVariable('_isAuthenticated', isAuthenticated);
            } catch (error) {
                // AuthenticationService may not be available in all contexts
                viewModel.setVariable('_isAuthenticated', false);
            }
        }

        this.preDispatch();
        if (this.getRequest().isDispatched()) {
            // Stop dispatch if there is a redirect hook
            //if(!this.getResponse().isRedirect()) {
            const actionResult = this[this.getRequest().getActionName()]();
            // Handle async actions that return promises
            if (actionResult && typeof actionResult.then === 'function') {
                // Return the promise so the bootstrapper can await it
                return actionResult.then(resolvedView => {
                    this.postDispatch();
                    return resolvedView;
                });
            } else {
                view = actionResult;
            }
            //}

            this.postDispatch();
        }

        return view;
    }

    getDelimiter() {
        return this.delimiter;
    }

    setDelimiter(delimiter) {
        this.delimiter = delimiter;
    }

    notFoundAction() {
        // Framework-level 404 handling - delegate to trigger404 for consistency
        return this.trigger404();
    }

    serverErrorAction() {
        // Framework-level 500 handling - delegate to trigger500 for consistency
        return this.trigger500();
    }

    setPluginManager(pluginManager) {
        // Type checking removed since we're getting it from ServiceManager
        // which ensures proper instantiation
        this.pluginManager = pluginManager;
        this.pluginManager.setController(this)
    }

    getPluginManager() {
        if (!this.pluginManager) {
            // Get PluginManager from ServiceManager
            const pluginManager = this.getServiceManager().get('PluginManager');
            this.setPluginManager(pluginManager);
        }

        return this.pluginManager;
    }

    getViewManager() {
        if (!this.viewManager) {
            // Get ViewManager from ServiceManager
            this.viewManager = this.getServiceManager().get('ViewManager');
        }

        return this.viewManager;
    }

    getViewHelperManager() {
        // Get ViewHelperManager from ServiceManager
        return this.getServiceManager().get('ViewHelperManager');
    }

    plugin(name, options = {}) {
        return this.getPluginManager().get(name, options);
    }

    helper(name, options = {}) {
        return this.getViewHelperManager().get(name, options);
    }

    preDispatch() { }

    postDispatch() { }


    /**
     * Helper method to get flash messages for views
     * @param {boolean} clearAfterRead - Whether to clear messages after reading (default: true)
     * @returns {Object} Flash messages organized by type
     */
    getFlashMessages(clearAfterRead = true) {
        const flashMessenger = this.plugin('flashMessenger');
        return flashMessenger.getAllMessages(clearAfterRead);
    }

    /**
     * Programmatically trigger 404 page (like ZF's forward to not-found)
     * @param {string} message - Custom error message
     * @param {Error} error - Optional error object for debugging
     * @returns {ViewModel} 404 view model
     */
    trigger404(message = null, error = null) {
        const viewManager = this.getViewManager();
        const errorViewModel = viewManager.createErrorViewModel(404, message, error);

        const viewModel = new ViewModel();
        viewModel.setTemplate(errorViewModel.template);

        // Set all variables from the view manager
        Object.keys(errorViewModel.variables).forEach(key => {
            viewModel.setVariable(key, errorViewModel.variables[key]);
        });

        return viewModel;
    }

    /**
     * Programmatically trigger 500 server error page (like ZF's exception handling)
     * @param {string} message - Custom error message
     * @param {Error} error - Optional error object for debugging
     * @returns {ViewModel} 500 view model
     */
    trigger500(message = null, error = null) {
        const viewManager = this.getViewManager();
        const errorViewModel = viewManager.createErrorViewModel(500, message, error);

        const viewModel = new ViewModel();
        viewModel.setTemplate(errorViewModel.template);

        // Set all variables from the view manager
        Object.keys(errorViewModel.variables).forEach(key => {
            viewModel.setVariable(key, errorViewModel.variables[key]);
        });

        return viewModel;
    }

}

module.exports = BaseController;
