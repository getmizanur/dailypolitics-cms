const AbstractFactory = require('../../../library/mvc/service/abstract-factory');

/**
 * Factory for creating Session Store
 */
class SessionStoreFactory extends AbstractFactory {

    /**
     * Create service instance
     * @param {ServiceManager} serviceManager
     * @returns {Object|null} Session store instance or null
     */
    createService(serviceManager) {
        const config = serviceManager.get('Config');
        const sessionConfig = config.session || {};

        return this.createSessionStore(sessionConfig);
    }

    /**
     * Async initialization for Redis store
     * Call this during app bootstrap to ensure Redis is connected before session middleware
     * @param {Object} sessionConfig
     * @returns {Promise<Object|null>}
     */
    async createSessionStoreAsync(sessionConfig) {
        const storeType = sessionConfig.store || 'file';

        if (storeType.toLowerCase() === 'redis') {
            try {
                const { RedisStore } = require('connect-redis');
                const { createClient } = require('redis');
                const storeOptions = sessionConfig.store_options || {};

                const client = createClient({
                    url: `redis://${storeOptions.password ? `:${storeOptions.password}@` : ''}${storeOptions.host || 'localhost'}:${storeOptions.port || 6379}`,
                    database: storeOptions.db || 0
                });

                // Handle client events
                client.on('error', (err) => console.error('Redis Client Error', err));
                client.on('connect', () => console.log('Redis client connected successfully'));
                client.on('ready', () => console.log('Redis client ready'));

                // AWAIT the connection before proceeding
                console.log('Connecting to Redis for session store...');
                await client.connect();
                console.log('Redis connection established for session store');

                return new RedisStore({
                    client: client,
                    prefix: storeOptions.prefix || 'sess:',
                    ttl: storeOptions.ttl
                });
            } catch (error) {
                console.error('Failed to create Redis store:', error.message);
                return null;
            }
        }

        // For non-Redis stores, use synchronous creation
        return this.createSessionStore(sessionConfig);
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
                    const { RedisStore } = require('connect-redis');
                    const { createClient } = require('redis');

                    // Create Redis client
                    const client = createClient({
                        url: `redis://${storeOptions.password ? `:${storeOptions.password}@` : ''}${storeOptions.host || 'localhost'}:${storeOptions.port || 6379}`,
                        database: storeOptions.db || 0
                    });

                    // Handle client errors
                    client.on('error', (err) => console.error('Redis Client Error', err));
                    client.on('connect', () => console.log('Redis client connected successfully'));
                    client.on('ready', () => console.log('Redis client ready'));

                    // Connect to Redis synchronously (important: must await this in async context)
                    // Note: connect-redis v7+ handles connection state internally
                    // We start the connection but don't await - RedisStore will handle it
                    client.connect().then(() => {
                        console.log('Redis connection established for session store');
                    }).catch((err) => {
                        console.error('Failed to connect to Redis:', err);
                    });

                    console.log('Creating Redis session store with options:', { prefix: storeOptions.prefix, ttl: storeOptions.ttl });
                    return new RedisStore({
                        client: client,
                        prefix: storeOptions.prefix || 'sess:',
                        ttl: storeOptions.ttl
                    });
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
}

module.exports = SessionStoreFactory;
