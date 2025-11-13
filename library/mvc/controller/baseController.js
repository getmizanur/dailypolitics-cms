const ViewModel = require('../view/viewModel');
const PluginManager = require('./pluginManager');
const ServiceManager = require('../service/serviceManager');
const ViewManager = require('../view/viewManager');

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
        if(!this.serviceLocator) {
            this.setServiceLocator(new ServiceManager());
        }

        return this.serviceLocator;
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

    setView(viewModel) {
        this.model = viewModel;
    }

    getView() {
		if(this.model == null) {
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

    returnResponse() {
        return this.returnResponse;
    }

    dispatch(request = null, response = null) {
        let view = null; 

        if(request != null) {
            this.setRequest(request);
        }else{
            request = this.getRequest(); 
        }

        if(response != null) {
            this.setResponse(response);
        }else{
            response = this.getResponse();
        } 

        this.preDispatch();
        if(this.getRequest().isDispatched()) {
            // Stop dispatch if there is a redirect hook
            //if(!this.getResponse().isRedirect()) {
                view = this[this.getRequest().getActionName()]();
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
        if(!(pluginManager instanceof PluginManager)) {
            throw Error('Invalid PluginManager');
        }
        this.pluginManager = pluginManager;
        this.pluginManager.setController(this)
    }

    getPluginManager() {
        if(!this.pluginManager) {
            const pluginManager = new PluginManager();
            
            // Pass configuration to plugin manager if available
            if (this.container && this.container.get) {
                try {
                    const appConfig = this.container.get('application');
                    pluginManager.setConfig(appConfig);
                } catch (error) {
                    console.warn('Could not load application config for plugin manager:', error.message);
                }
            }
            
            this.setPluginManager(pluginManager);
        }

        return this.pluginManager;
    }

    getViewManager() {
        if (!this.viewManager) {
            // Get view_manager configuration from application config
            let viewManagerConfig = {};
            if (this.container && this.container.get) {
                try {
                    const appConfig = this.container.get('application');
                    viewManagerConfig = appConfig.view_manager || {};
                } catch (error) {
                    console.warn('Could not load view_manager config:', error.message);
                }
            }
            
            this.viewManager = new ViewManager(viewManagerConfig);
        }

        return this.viewManager;
    }

    plugin(name, options = {}) {
        return this.getPluginManager().get(name, options);
    }

    helper(name, options = {}) {
        return this.getViewManager().getHelper(name, options);
    }

    preDispatch() {}

    postDispatch() {
        // Initialize automatic page title if none was set by the action
        this.plugin('pageTitle').initializePageTitle();
    }
    
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
     * Helper method to render view with proper template path
     * @param {string} template - Template path (e.g., 'intro/index/test')
     * @param {Object} variables - Variables to pass to view
     * @returns {ViewModel} Configured view model
     */
    renderView(template, variables = {}) {
        const viewModel = this.getView();
        viewModel.setTemplate(template);
        
        // Set variables
        Object.keys(variables).forEach(key => {
            viewModel.setVariable(key, variables[key]);
        });
        
        return viewModel;
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
