const os = require('os');

module.exports = {
    // Router configuration - consolidated routing setup
    "router": require('./routes.config'),
    
    // Cache configuration with environment-specific settings and file-based backend for development
    "cache": {
        "enabled": process.env.CACHE_ENABLED !== 'false', // Allow disabling via env var
        "frontend": "Core",
        "backend": "File", // File backend for simple development setup
        "frontend_options": {
            "automatic_serialization": true,
            "lifetime": parseInt(process.env.CACHE_LIFETIME) || 3600 // 1 hour default
        },
        "backend_options": {
            // File backend configuration for development
            "cache_dir": process.env.CACHE_DIR || global.applicationPath('/tmp/cache'),
            "file_locking": process.env.CACHE_FILE_LOCKING !== 'false', // Enable file locking by default
            "read_control": process.env.CACHE_READ_CONTROL !== 'false', // Enable read control by default
            "file_name_prefix": process.env.CACHE_FILE_PREFIX || "cache_",
            "cache_file_perm": parseInt(process.env.CACHE_FILE_PERM) || 0o644,
            "metatadatas_array_max_size": parseInt(process.env.CACHE_METADATA_MAX_SIZE) || 100
            
            /*
             * ALTERNATIVE BACKEND CONFIGURATIONS (for production reference):
             * 
             * Memcache Backend:
             * "backend": "Memcache",
             * "backend_options": {
             *     "persistent": {
             *         "server": { 
             *             "host": process.env.MEMCACHE_HOST || "localhost", 
             *             "port": parseInt(process.env.MEMCACHE_PORT) || 11211, 
             *             "ttl": parseInt(process.env.PERSISTENT_CACHE_TTL) || 8000
             *         },
             *         "compression": true,
             *         "key_prefix": (process.env.MEMCACHE_KEY_PREFIX || "myapp") + "_persistent_"
             *     },
             *     "transient": {
             *         "server": { 
             *             "host": process.env.MEMCACHE_HOST || "localhost", 
             *             "port": parseInt(process.env.MEMCACHE_PORT) || 11211, 
             *             "ttl": parseInt(process.env.TRANSIENT_CACHE_TTL) || 4000
             *         },
             *         "compression": true,
             *         "key_prefix": (process.env.MEMCACHE_KEY_PREFIX || "myapp") + "_transient_"
             *     }
             * }
             * 
             * Redis Backend:
             * "backend": "Redis",
             * "backend_options": {
             *     "host": process.env.REDIS_HOST || "localhost",
             *     "port": parseInt(process.env.REDIS_PORT) || 6379,
             *     "password": process.env.REDIS_PASSWORD || null,
             *     "database": parseInt(process.env.REDIS_DB) || 0,
             *     "persistent": process.env.REDIS_PERSISTENT === 'true' || false
             * }
             */
        }
    },
    
    // Session configuration with environment-specific settings
    "session": {
        "enabled": process.env.SESSION_ENABLED !== 'false', // Allow disabling via env var
        "store": process.env.SESSION_STORE || "file", // Default: session-file-store for persistence
        "name": process.env.SESSION_NAME || "JSSESSIONID",
        "secret": process.env.SESSION_SECRET || "your-secret-key-change-in-production",
        "resave": process.env.SESSION_RESAVE === 'true' || false,
        "saveUninitialized": process.env.SESSION_SAVE_UNINITIALIZED === 'true' || false,
        "rolling": process.env.SESSION_ROLLING === 'true' || false,
        "cookie": {
            "maxAge": parseInt(process.env.SESSION_MAX_AGE) || 3600000, // 1 hour
            "httpOnly": process.env.SESSION_HTTP_ONLY !== 'false', // true by default
            "secure": process.env.SESSION_SECURE === 'true' || false, // false for development
            "sameSite": process.env.SESSION_SAME_SITE || 'lax',
            "path": process.env.SESSION_COOKIE_PATH || '/'
        },
        // Store options for current store type (file store - session-file-store)
        "store_options": {
            "path": process.env.FILE_SESSION_PATH || global.applicationPath('/tmp/sessions'),
            "ttl": parseInt(process.env.FILE_SESSION_TTL) || 3600, // 1 hour
            "retries": parseInt(process.env.FILE_SESSION_RETRIES) || 5,
            "factor": parseInt(process.env.FILE_SESSION_FACTOR) || 1,
            "minTimeout": parseInt(process.env.FILE_SESSION_MIN_TIMEOUT) || 50,
            "maxTimeout": parseInt(process.env.FILE_SESSION_MAX_TIMEOUT) || 100,
            "fileExtension": process.env.FILE_SESSION_EXTENSION || '.json',
            "encoding": process.env.FILE_SESSION_ENCODING || 'utf8',
            "logFn": process.env.NODE_ENV === 'development' ? console.log : undefined // Logging only in development
        },
        // Security options for session management
        "security": {
            "enabled": process.env.SESSION_SECURITY_ENABLED !== 'false',
            "secret": process.env.SESSION_SECURITY_SECRET || process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
            "algorithm": process.env.SESSION_SECURITY_ALGORITHM || 'sha256',
            "signatureLength": parseInt(process.env.SESSION_SIGNATURE_LENGTH) || 16,
            "validateUserAgent": process.env.SESSION_VALIDATE_USER_AGENT === 'true' || false,
            "validateIpAddress": process.env.SESSION_VALIDATE_IP === 'true' || false
        }

        /*
         * ALTERNATIVE STORE CONFIGURATIONS (for future reference):
         * 
         * Redis Store (connect-redis):
         * "store": "redis",
         * "store_options": {
         *     "host": process.env.REDIS_HOST || "localhost",
         *     "port": parseInt(process.env.REDIS_PORT) || 6379,
         *     "password": process.env.REDIS_PASSWORD || null,
         *     "db": parseInt(process.env.REDIS_DB) || 0,
         *     "prefix": process.env.REDIS_SESSION_PREFIX || "sess:",
         *     "ttl": parseInt(process.env.REDIS_SESSION_TTL) || 3600,
         *     "logErrors": process.env.REDIS_LOG_ERRORS !== 'false'
         * }
         * 
         * MongoDB Store (connect-mongo):
         * "store": "mongodb",
         * "store_options": {
         *     "url": process.env.MONGODB_SESSION_URL || "mongodb://localhost:27017/sessions",
         *     "collection": process.env.MONGODB_SESSION_COLLECTION || "sessions",
         *     "expires": parseInt(process.env.MONGODB_SESSION_EXPIRES) || 3600000,
         *     "touchAfter": parseInt(process.env.MONGODB_TOUCH_AFTER) || 24 * 3600
         * }
         * 
         * MySQL Store (express-mysql-session):
         * "store": "mysql",
         * "store_options": {
         *     "host": process.env.MYSQL_HOST || "localhost",
         *     "port": parseInt(process.env.MYSQL_PORT) || 3306,
         *     "user": process.env.MYSQL_USER || "root",
         *     "password": process.env.MYSQL_PASSWORD || "",
         *     "database": process.env.MYSQL_DATABASE || "sessions",
         *     "table": process.env.MYSQL_SESSION_TABLE || "sessions",
         *     "checkExpirationInterval": parseInt(process.env.MYSQL_CHECK_EXPIRATION) || 900000,
         *     "expiration": parseInt(process.env.MYSQL_SESSION_EXPIRATION) || 3600000,
         *     "createDatabaseTable": process.env.MYSQL_CREATE_TABLE !== 'false'
         * }
         * 
         * Memory Store (development only - not recommended for production):
         * "store": "memory",
         * "store_options": {}
         */
    },
    
    // Database configuration with PostgreSQL
    "database": {
        "enabled": process.env.DATABASE_ENABLED !== 'false',
        "adapter": process.env.DATABASE_ADAPTER || "postgresql",
        "connection": {
            "host": process.env.DATABASE_HOST || "localhost",
            "port": parseInt(process.env.DATABASE_PORT) || 5432,
            "username": process.env.DATABASE_USER || "postgres",
            "password": process.env.DATABASE_PASSWORD || "",
            "database": process.env.DATABASE_NAME || "dailypolitics_cms",
            "ssl": process.env.DATABASE_SSL === 'true' || false,
            "connectionTimeoutMillis": parseInt(process.env.DATABASE_CONNECTION_TIMEOUT) || 30000,
            "idleTimeoutMillis": parseInt(process.env.DATABASE_IDLE_TIMEOUT) || 30000,
            "max": parseInt(process.env.DATABASE_MAX_CONNECTIONS) || 20
        },
        "options": {
            "useNullAsDefault": true,
            "debug": process.env.DATABASE_DEBUG === 'true' || false,
            "pool": {
                "min": parseInt(process.env.DATABASE_POOL_MIN) || 2,
                "max": parseInt(process.env.DATABASE_POOL_MAX) || 10
            }
        }
        /*
         * ALTERNATIVE DATABASE CONFIGURATIONS (for future reference):
         * 
         * MySQL Configuration:
         * "adapter": "mysql",
         * "connection": {
         *     "host": process.env.DATABASE_HOST || "localhost",
         *     "port": parseInt(process.env.DATABASE_PORT) || 3306,
         *     "user": process.env.DATABASE_USER || "root",
         *     "password": process.env.DATABASE_PASSWORD || "",
         *     "database": process.env.DATABASE_NAME || "dailypolitics_cms",
         *     "charset": process.env.DATABASE_CHARSET || "utf8mb4",
         *     "timezone": process.env.DATABASE_TIMEZONE || "UTC"
         * }
         * 
         * SQL Server Configuration:
         * "adapter": "sqlserver",
         * "connection": {
         *     "server": process.env.DATABASE_HOST || "localhost",
         *     "port": parseInt(process.env.DATABASE_PORT) || 1433,
         *     "user": process.env.DATABASE_USER || "sa",
         *     "password": process.env.DATABASE_PASSWORD || "",
         *     "database": process.env.DATABASE_NAME || "dailypolitics_cms",
         *     "encrypt": process.env.DATABASE_ENCRYPT === 'true' || true,
         *     "trustServerCertificate": process.env.DATABASE_TRUST_CERT === 'true' || false
         * }
         * 
         * SQLite Configuration:
         * "adapter": "sqlite",
         * "connection": {
         *     "filename": process.env.DATABASE_PATH || global.applicationPath('/data/database.db')
         * }
         */
    },
    
    // Service Manager configuration
    "service_manager": {
        "invokables": {
            "EmailService": "/application/service/verifyEmailService",
            "PostService": "/application/service/postService"
        }
    },
    
    // Controller Plugins configuration - only custom application plugins
    // Framework plugins (flashMessenger, layout, params, etc.) are managed by PluginManager
    "controller_plugins": {
        "invokables": {
            "pageTitle": {
                "class": "/application/plugin/pageTitle",
                "description": "Page title management plugin"
            }
            // Add your custom application plugins here
            // Example:
            // "customPlugin": {
            //     "class": "/application/plugin/customPlugin",
            //     "description": "Your custom plugin description"
            // }
        }
    },
    
    // View Helpers configuration - only custom application helpers
    // Framework helpers (form, formButton, etc.) are managed by ViewHelperManager
    "view_helpers": {
        "invokables": {
            "sidebar": {
                "class": "/application/helper/recentPostsSidebarHelper",
                "params": ["posts = null"]
            },
            "adminSidebar": {
                "class": "/application/helper/adminSidebarHelper",
                "params": []
            },
            "pages": {
                "class": "/application/helper/paginationHelper",
                "params": ["options = {}"]
            },
            "truncate": {
                "class": "/application/helper/truncateHelper",
                "params": ["text", "wordLimit = 100", "ellipsis = '...'"]
            },
            "errorDecorator": {
                "class": "/application/helper/errorDecoratorHelper",
                "params": ["element", "errorClass = 'dp-input--error'"]
            },
            "onDemandCss": {
                "class": "/application/helper/onDemandCssHelper",
                "params": ["controller"]
            },
            "newsArticleJsonLd": {
                "class": "/application/helper/newsArticleJsonLdHelper",
                "params": ["data", "options = {}"]
            }
        }
        // Add your custom application helpers here
        // Example:
        // "customHelper": {
        //     "class": "/application/helper/customHelper",
        //     "description": "Your custom helper description"
        // }
    },

    "view_manager" : {
        "display_not_found_reason": process.env.VIEW_DISPLAY_NOT_FOUND_REASON === 'true' || false,
        "display_exceptions": process.env.VIEW_DISPLAY_EXCEPTIONS === 'true' || false,
        "doctype": process.env.VIEW_DOCTYPE || "HTML5",
        "not_found_template": process.env.VIEW_NOT_FOUND_TEMPLATE || "error/404",
        "exception_template": process.env.VIEW_EXCEPTION_TEMPLATE || "error/500",
        "template_map": {
            "layout/master": global.applicationPath('/view/layout/master.njk'),
            "error/404": global.applicationPath('/view/error/404.njk'),
            "error/500": global.applicationPath('/view/error/500.njk')
        },
        "template_path_stack": [
            global.applicationPath('/view')
        ]
    }
};