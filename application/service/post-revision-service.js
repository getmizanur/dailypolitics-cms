const AbstractService = require('./abstract-service');

/**
 * PostRevisionService - Service class for managing post revisions
 * Extends AbstractService to provide database operations for post_revisions table
 * using PostgreSQL adapter and query builder system
 */
class PostRevisionService extends AbstractService {
    constructor() {
        super();
        this.dbAdapter = null;
    }

    /**
     * Initialize database adapter and query builder
     * @returns {Object} Database adapter instance
     */
    async initializeDatabase() {
        if (!this.dbAdapter) {
            const config = this.loadApplicationConfig();

            if (!config.database?.enabled) {
                throw new Error('Database is not enabled in configuration');
            }

            // Load the appropriate database adapter
            const adapterName = config.database.adapter || 'postgresql';
            // Map adapter names to kebab-case filenames
            const adapterFileMap = {
                'postgresql': 'postgre-sql-adapter',
                'mysql': 'mysql-adapter',
                'sqlserver': 'sql-server-adapter',
                'sqlite': 'sqlite-adapter'
            };
            const adapterFile = adapterFileMap[adapterName] || `${adapterName}-adapter`;
            const AdapterClass = require(`../../library/db/adapter/${adapterFile}`);

            this.dbAdapter = new AdapterClass(config.database.connection);

            // Connect to database
            await this.dbAdapter.connect();
        }

        return this.dbAdapter;
    }

    /**
     * Get new Select query builder instance
     * @returns {Select} Select query builder
     */
    async getSelectQuery() {
        const adapter = await this.initializeDatabase();
        const Select = require('../../library/db/sql/select');
        return new Select(adapter);
    }

    /**
     * Get the most recent draft revision for a post
     * Note: Due to unique constraint, only one draft revision can exist
     * per post
     * @param {number} postId - Post ID to get revision for
     * @returns {Promise<Object|null>} Most recent draft revision or null
     *                                  if not found
     */
    async getMostRecentDraftRevision(postId) {
        try {
            const select = await this.getSelectQuery();

            // Build query to get the draft revision with creator/approver info
            // Note: There can only be one draft per post due to unique
            // constraint
            select.from('post_revisions')
                  .joinLeft('users as creator',
                      'post_revisions.created_by = creator.id')
                  .joinLeft('users as approver',
                      'post_revisions.approved_by = approver.id')
                  .joinLeft('categories',
                      'post_revisions.category_id = categories.id')
                  .joinLeft('presentation_styles',
                      'post_revisions.presentation_style_id = ' +
                      'presentation_styles.id')
                  .columns([
                      'post_revisions.*',
                      'creator.name as created_by_name',
                      'creator.email as created_by_email',
                      'approver.name as approved_by_name',
                      'approver.email as approved_by_email',
                      'categories.name as category_name',
                      'presentation_styles.name as presentation_style_name'
                  ])
                  .where('post_revisions.post_id = ?', postId)
                  .where('post_revisions.status = ?', 'draft')
                  .order('post_revisions.created_at', 'DESC')
                  .limit(1);

            const result = await select.execute();
            const rows = result.rows || result;

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error fetching most recent draft revision:',
                error);
            throw error;
        }
    }

    /**
     * Get all revisions for a post
     * @param {number} postId - Post ID to get revisions for
     * @param {Array<string>} statuses - Optional array of statuses to
     *                                    filter by (default: all)
     *                                    Valid: ['draft', 'approved',
     *                                    'superseded']
     * @param {number} limit - Optional limit for results
     * @returns {Promise<Array>} Array of revisions
     */
    async getRevisionsByPostId(postId, statuses = null, limit = null) {
        try {
            const select = await this.getSelectQuery();

            select.from('post_revisions')
                  .joinLeft('users as creator',
                      'post_revisions.created_by = creator.id')
                  .joinLeft('users as approver',
                      'post_revisions.approved_by = approver.id')
                  .joinLeft('categories',
                      'post_revisions.category_id = categories.id')
                  .joinLeft('presentation_styles',
                      'post_revisions.presentation_style_id = ' +
                      'presentation_styles.id')
                  .columns([
                      'post_revisions.*',
                      'creator.name as created_by_name',
                      'creator.email as created_by_email',
                      'approver.name as approved_by_name',
                      'approver.email as approved_by_email',
                      'categories.name as category_name',
                      'presentation_styles.name as presentation_style_name'
                  ])
                  .where('post_revisions.post_id = ?', postId)
                  .order('post_revisions.created_at', 'DESC');

            // Filter by statuses if provided
            if (statuses && Array.isArray(statuses) &&
                statuses.length > 0) {
                select.where('post_revisions.status = ANY(?)', [statuses]);
            }

            // Apply limit if provided
            if (limit !== null) {
                select.limit(limit);
            }

            const result = await select.execute();
            return result.rows || result;
        } catch (error) {
            console.error('Error fetching revisions by post ID:', error);
            throw error;
        }
    }

    /**
     * Get a single revision by ID
     * @param {number} revisionId - Revision ID
     * @returns {Promise<Object|null>} Revision object or null if not found
     */
    async getRevisionById(revisionId) {
        try {
            const select = await this.getSelectQuery();

            select.from('post_revisions')
                  .joinLeft('users as creator',
                      'post_revisions.created_by = creator.id')
                  .joinLeft('users as approver',
                      'post_revisions.approved_by = approver.id')
                  .joinLeft('categories',
                      'post_revisions.category_id = categories.id')
                  .joinLeft('presentation_styles',
                      'post_revisions.presentation_style_id = ' +
                      'presentation_styles.id')
                  .columns([
                      'post_revisions.*',
                      'creator.name as created_by_name',
                      'creator.email as created_by_email',
                      'approver.name as approved_by_name',
                      'approver.email as approved_by_email',
                      'categories.name as category_name',
                      'presentation_styles.name as presentation_style_name'
                  ])
                  .where('post_revisions.id = ?', revisionId);

            const result = await select.execute();
            const rows = result.rows || result;

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error fetching revision by ID:', error);
            throw error;
        }
    }

    /**
     * Create a new revision
     * @param {Object} revisionData - Revision data to insert
     * @param {number} revisionData.post_id - Post ID (required)
     * @param {string} revisionData.title - Title (required)
     * @param {string} revisionData.excerpt_markdown - Excerpt markdown
     * @param {string} revisionData.excerpt_html - Excerpt HTML
     * @param {string} revisionData.content_markdown - Content markdown
     *                                                  (required)
     * @param {string} revisionData.content_html - Content HTML (required)
     * @param {string} revisionData.meta_title - Meta title for SEO
     * @param {string} revisionData.meta_description - Meta description
     * @param {number} revisionData.category_id - Category ID
     * @param {number} revisionData.presentation_style_id - Presentation
     *                                                       style ID
     * @param {string} revisionData.change_reason - Reason for this
     *                                               revision
     * @param {string} revisionData.status - Status: 'draft', 'approved',
     *                                        or 'superseded' (default:
     *                                        'draft')
     * @param {number} revisionData.created_by - User ID who created this
     * @param {number} revisionData.approved_by - User ID who approved this
     * @param {string} revisionData.approved_at - Approval timestamp
     * @returns {Promise<Object>} Created revision object with ID
     */
    async createRevision(revisionData) {
        try {
            const adapter = await this.initializeDatabase();
            const Insert = require('../../library/db/sql/insert');
            const insert = new Insert(adapter);

            console.log('Creating revision with data:', JSON.stringify(revisionData, null, 2));

            // Build insert query with RETURNING clause for PostgreSQL
            insert.into('post_revisions')
                  .values(revisionData)
                  .returning('id');

            // Execute the INSERT query
            const sql = insert.toString();
            const params = insert.parameters;
            const result = await adapter.query(sql, params);

            // PostgreSQL adapter returns an array with the result from RETURNING clause
            let insertedId;
            if (Array.isArray(result) && result.length > 0 && result[0].id) {
                insertedId = result[0].id;
                console.log('Successfully created revision with ID:', insertedId);
            } else {
                console.error('Unexpected result format from INSERT:', result);
                throw new Error('Failed to retrieve inserted revision ID');
            }

            // Return the newly created revision
            return await this.getRevisionById(insertedId);
        } catch (error) {
            console.error('Error creating revision:', error);
            throw error;
        }
    }

    /**
     * Update a revision by ID
     * @param {number} revisionId - Revision ID to update
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated revision object
     */
    async updateRevision(revisionId, updateData) {
        try {
            const adapter = await this.initializeDatabase();
            const Update = require('../../library/db/sql/update');
            const update = new Update(adapter);

            // Build update query
            update.table('post_revisions')
                  .set(updateData)
                  .where('id = ?', revisionId);

            await update.execute();

            // Return the updated revision
            return await this.getRevisionById(revisionId);
        } catch (error) {
            console.error('Error updating revision:', error);
            throw error;
        }
    }

    /**
     * Delete a revision by ID
     * @param {number} revisionId - Revision ID to delete
     * @returns {Promise<boolean>} True if deleted successfully
     */
    async deleteRevision(revisionId) {
        try {
            const adapter = await this.initializeDatabase();
            const Delete = require('../../library/db/sql/delete');
            const deleteQuery = new Delete(adapter);

            // Build delete query
            deleteQuery.from('post_revisions')
                       .where('id = ?', revisionId);

            await deleteQuery.execute();
            console.log('Successfully deleted revision with ID:', revisionId);

            return true;
        } catch (error) {
            console.error('Error deleting revision:', error);
            throw error;
        }
    }

    /**
     * Update all draft revisions for a post to 'superseded' status
     * Useful when creating a new draft revision
     * @param {number} postId - Post ID
     * @param {number} excludeRevisionId - Optional revision ID to exclude from update
     * @returns {Promise<boolean>} True if updated successfully
     */
    async supersedeDraftRevisions(postId, excludeRevisionId = null) {
        try {
            const adapter = await this.initializeDatabase();
            const Update = require('../../library/db/sql/update');
            const update = new Update(adapter);

            // Build update query
            update.table('post_revisions')
                  .set({ status: 'superseded' })
                  .where('post_id = ?', postId)
                  .where('status = ?', 'draft');

            // Exclude specific revision if provided
            if (excludeRevisionId !== null) {
                update.where('id != ?', excludeRevisionId);
            }

            await update.execute();
            console.log('Successfully superseded draft revisions for post:', postId);

            return true;
        } catch (error) {
            console.error('Error superseding draft revisions:', error);
            throw error;
        }
    }

    /**
     * Count revisions by post ID and status
     * @param {number} postId - Post ID
     * @param {string} status - Optional status to filter by
     * @returns {Promise<number>} Count of revisions
     */
    async countRevisions(postId, status = null) {
        try {
            const select = await this.getSelectQuery();

            select.from('post_revisions')
                  .columns(['COUNT(*) as count'])
                  .where('post_id = ?', postId);

            // Filter by status if provided
            if (status) {
                select.where('status = ?', status);
            }

            const result = await select.execute();
            const rows = result.rows || result;

            return parseInt(rows[0].count) || 0;
        } catch (error) {
            console.error('Error counting revisions:', error);
            throw error;
        }
    }

    /**
     * Close database connection
     * Call this when shutting down the application
     */
    async closeConnection() {
        if (this.dbAdapter && typeof this.dbAdapter.close === 'function') {
            await this.dbAdapter.close();
        }
    }
}

module.exports = PostRevisionService;
