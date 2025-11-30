const StringUtil = require('../../util/string-util');
const ViewModel = require('../view/view-model');
const ServiceManager = require('../../service/service-manager');


class BaseController {

    constructor(options = {}) {
        this.container = options.container || null;
        this.serviceManager = options.serviceManager || null;

        if (this.serviceManager) {
            this.serviceManager.setController(this);
        }


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

    setServiceManager(serviceManager) {
        this.serviceManager = serviceManager;
        this.serviceManager.setController(this);

        return this;
    }

    getServiceManager() {
        if (!this.serviceManager) {
            throw new Error('ServiceManager not injected into Controller');
        }
        return this.serviceManager;
    }

    getConfig() {
        return this.getServiceManager().get('Config');
    }

    getRequest() {
        return this.getServiceManager().get('Application').getRequest();
    }

    getResponse() {
        return this.getServiceManager().get('Application').getResponse();
    }

    getSession() {
        if (!this.getRequest()) {
            throw new Error('Request object not available');
        }
        return this.getRequest().session;
    }

    setSession(session) {
        if (!this.getRequest()) {
            throw new Error('Request object not available');
        }
        this.getRequest().session = session;
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

        // request and response arguments are ignored as we use the Application service source of truth

        // Set module and controller metadata as template variables (before preDispatch to ensure availability)
        const viewModel = this.getView();
        const req = this.getRequest();
        if (viewModel && req) {
            // Set module name (from route)
            if (typeof req.getModuleName === 'function') {
                viewModel.setVariable('_moduleName', req.getModuleName());
            }

            // Set controller name (from route)
            if (typeof req.getControllerName === 'function') {
                viewModel.setVariable('_controllerName', req.getControllerName());
            }

            // Set action name (from route)
            if (typeof req.getActionName === 'function') {
                let action = req.getActionName();
                viewModel.setVariable('_actionName', StringUtil.toKebabCase(action).replace('-action', ''));
            }

            // Set route name for convenience
            if (typeof req.getRouteName === 'function') {
                viewModel.setVariable('_routeName', req.getRouteName());
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

    getPluginManager() {
        if (!this.pluginManager) {
            this.pluginManager = this.getServiceManager().get('PluginManager');
            this.pluginManager.setController(this);
        }
        return this.pluginManager;
    }

    getViewManager() {
        if (!this.viewManager) {
            this.viewManager = this.getServiceManager().get('ViewManager');
        }
        return this.viewManager;
    }

    getViewHelperManager() {
        if (!this.viewHelperManager) {
            this.viewHelperManager = this.getServiceManager().get('ViewHelperManager');
        }
        return this.viewHelperManager;
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
