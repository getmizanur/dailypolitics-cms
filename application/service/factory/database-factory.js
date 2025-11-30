/**
 * Database Factory - Creates database adapter instances
 *
 * This factory creates database connections using custom adapters from /library/db/adapter
 * instead of third-party ORM libraries. Supports PostgreSQL, MySQL, SQL Server, and SQLite.
 *
 * Usage in controller:
 *   const db = this.getServiceManager().get('Database');
 *   const posts = await db.fetchAll('SELECT * FROM posts WHERE status = $1', ['published']);
 */

const AbstractFactory = require(global.applicationPath('/library/mvc/service/abstract-factory'));

class DatabaseFactory extends AbstractFactory {

    /**
     * Create Database service (adapter instance)
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {DatabaseAdapter} Database adapter instance
     */
    createService(serviceManager) {
        try {
            // Get configuration directly from ServiceManager
            const appConfig = serviceManager.get('Config');
            const dbConfig = appConfig.database || {};

            if (!dbConfig.enabled) {
                throw new Error('Database is not enabled in configuration');
            }

            // Map adapter names to adapter classes
            const adapterMap = {
                'postgresql': global.applicationPath('/library/db/adapter/postgre-sql-adapter'),
                'mysql': global.applicationPath('/library/db/adapter/mysql-adapter'),
                'sqlserver': global.applicationPath('/library/db/adapter/sql-server-adapter'),
                'sqlite': global.applicationPath('/library/db/adapter/sqlite-adapter')
            };

            const adapterPath = adapterMap[dbConfig.adapter];
            if (!adapterPath) {
                throw new Error(`Unknown database adapter: ${dbConfig.adapter}. Supported adapters: postgresql, mysql, sqlserver, sqlite`);
            }

            // Load the adapter class
            const AdapterClass = require(adapterPath);

            // Create adapter instance with connection config
            const adapter = new AdapterClass(dbConfig.connection);

            // Note: Connection is established lazily on first query
            // Or you can establish it immediately if needed:
            // await adapter.connect();

            return adapter;

        } catch (error) {
            console.error('Could not create Database service:', error.message);
            throw error;
        }
    }
}

module.exports = DatabaseFactory;
