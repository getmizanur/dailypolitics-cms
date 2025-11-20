const path = require('path');

const Bootstrapper
    = require(global.applicationPath('/library/bootstrapper'));
const ClassUtil
    = require(global.applicationPath('/library/util/classUtil'));
const Registry
    = require(global.applicationPath('/library/registry'));const cookieSession = require('cookie-session');
const express = require('express');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const genuuid = require('uuid');
const session = require('express-session');
const compression = require('compression');
// body-parser is now built into Express 4.16+

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// IMPORTANT!
// It matters the order of init functions. 
// Please put them in order of how they should be called. 
class Bootstrap extends Bootstrapper {
	
	constructor(app) {
        super();
		this.app = app;
	}

    initAppConfig() {
        // Use Express's built-in body parsing middleware (available since Express 4.16)
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    initSession() {
        const session = require('express-session');
        
        // Get session configuration from application config
        let sessionConfig = {};
        try {
            const config = this.getContainer().get('application');
            sessionConfig = config.session || {};
        } catch (error) {
            // Configuration not loaded yet, use require directly
            const appConfig = require('./config/application.config');
            sessionConfig = appConfig.session || {};
        }
        
        // Skip session initialization if disabled
        if (sessionConfig.enabled === false) {
            console.log('Session middleware disabled via configuration');
            return;
        }
        
        this.app.set('trust proxy', 1); // trust first proxy
        
        // Build express-session configuration from our config
        const expressSessionConfig = {
            secret: sessionConfig.secret || 'your-secret-key-change-in-production',
            name: sessionConfig.name || 'JSSESSIONID',
            resave: sessionConfig.resave || false,
            saveUninitialized: sessionConfig.saveUninitialized || false,
            rolling: sessionConfig.rolling || false,
            cookie: sessionConfig.cookie || {
                maxAge: 3600000,
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                path: '/'
            }
        };
        
        // Add store based on configuration
        const store = this.createSessionStore(sessionConfig);
        if (store) {
            expressSessionConfig.store = store;
        }
        
        // Apply session middleware
        this.app.use(session(expressSessionConfig));
        
        console.log(`Express session middleware initialized with ${sessionConfig.store || 'memory'} store`);
    }

    createSessionStore(sessionConfig) {
        const storeType = sessionConfig.store || 'file';
        const storeOptions = sessionConfig.store_options || {};
        
        switch (storeType.toLowerCase()) {
            case 'file':
                try {
                    const session = require('express-session');
                    const FileStore = require('session-file-store')(session);
                    
                    // Clean up store options - remove logFn if it's not a function
                    const cleanOptions = { ...storeOptions };
                    if (!cleanOptions.logFn || typeof cleanOptions.logFn !== 'function') {
                        delete cleanOptions.logFn;
                    }
                    
                    console.log('Using file-based session store with options:', cleanOptions);
                    return new FileStore(cleanOptions);
                } catch (error) {
                    console.warn('File store not available, falling back to memory store:', error.message);
                    return null;
                }
                
            case 'redis':
                try {
                    const session = require('express-session');
                    const RedisStore = require('connect-redis')(session);
                    console.log('Using Redis session store with options:', storeOptions);
                    return new RedisStore(storeOptions);
                } catch (error) {
                    console.warn('Redis store not available, falling back to memory store:', error.message);
                    return null;
                }
                
            case 'mongodb':
                try {
                    const MongoStore = require('connect-mongo');
                    console.log('Using MongoDB session store with options:', storeOptions);
                    return MongoStore.create(storeOptions);
                } catch (error) {
                    console.warn('MongoDB store not available, falling back to memory store:', error.message);
                    return null;
                }
                
            case 'mysql':
                try {
                    const session = require('express-session');
                    const MySQLStore = require('express-mysql-session')(session);
                    console.log('Using MySQL session store with options:', storeOptions);
                    return new MySQLStore(storeOptions);
                } catch (error) {
                    console.warn('MySQL store not available, falling back to memory store:', error.message);
                    return null;
                }
                
            case 'memory':
            default:
                console.log('Using memory session store (not recommended for production)');
                // Use default MemoryStore (built into express-session)
                return null;
        }
    }

    initConfig(){
        let registry = new Registry();
        const appConfig = require('./config/application.config');
        registry.set('application', appConfig);
        // Use router configuration from consolidated config
        registry.set('routes', appConfig.router.routes);
        super.setContainer(registry);
    }
    
    initView() {
        const nunjucks = require('nunjucks');
        this.app.set('view engine', nunjucks);

        var env = nunjucks.configure([path.resolve('view')], {
            autoescape: false,
            express: this.app,
            watch: true,
            nocache: true
        });

        // Add date filter
        const dateFilter = require('nunjucks-date-filter');
        env.addFilter('date', dateFilter);

        this.app.use((req, res, next) => {
            res.locals.masterTemplate = 'layout/master.njk'
            next();
        });

        // register view helpers from configuration using ViewHelperManager
        const registry = super.getContainer();
        const appConfig = registry.get('application');
        const ViewHelperManager = require(global.applicationPath('/library/view/viewHelperManager'));
        
        const viewHelperManager = new ViewHelperManager();
        const applicationHelpers = appConfig.view_helpers?.invokables || {};
        
        // Validate application helpers (optional warning)
        const conflicts = viewHelperManager.validateApplicationHelpers(applicationHelpers);
        if (conflicts.length > 0) {
            console.warn(`Warning: Application helpers override framework helpers: ${conflicts.join(', ')}`);
        }
        
        // Get all helpers (framework + application)
        const allHelpers = viewHelperManager.getAllHelpers(applicationHelpers);

        // Register all view helpers from configuration (same pattern as before)
        Object.entries(allHelpers).forEach(([helperName, helperConfig]) => {
            env.addGlobal(helperName, function(...args) {
                // Handle both old string format and new object format
                const helperPath = typeof helperConfig === 'string' ? helperConfig : helperConfig.class;
                const ViewHelper = require(global.applicationPath(helperPath));
                const helperInstance = new ViewHelper();

                // IMPORTANT: pass Nunjucks ctx as FINAL argument
                return helperInstance.render(...args, this);
                //                                     ^^^ this = Nunjucks ctx
            });
        });
    }

	initHelper() {
        this.app.use(express.static('public'));
	}

    initRouter() {
        // Mount routers 
        const registry = super.getContainer();
        const router = registry.get('routes');
        for(let key in router) {
            if(router[key].hasOwnProperty('route')) {
                this.app.all(router[key].route,
                    async (req, res, next) => this.dispatcher(req, res, next));
            }
        }
        
        // Add 404 handler middleware (must be after all other routes)
        this.app.use((req, res, next) => {
            try {
                // Resolve 404 template path using framework-level error handling
                const errorTemplateInfo = this.resolveErrorTemplate('404');
                const templatePath = errorTemplateInfo.templatePath;
                
                const templateData = {
                    pageTitle: 'Page Not Found',
                    errorCode: 404,
                    errorMessage: 'The page you are looking for could not be found.'
                };
                
                // Set 404 status and render template directly (no MVC overhead)
                res.status(404);
                res.render(templatePath, templateData);
            } catch (error) {
                // If error template resolution fails, send basic error response
                console.error('Error template resolution failed:', error.message);
                res.status(404).send(`
                    <h1>404 - Page Not Found</h1>
                    <p>The page you are looking for could not be found.</p>
                    <hr>
                    <p><strong>Developer Note:</strong> ${error.message}</p>
                `);
            }
        });
    }
}

module.exports = Bootstrap;
