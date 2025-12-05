const AbstractService = require('./abstract-service');

/**
 * PostService - Service class for managing blog posts
 * Extends AbstractService to provide database operations for posts
 * using PostgreSQL adapter and query builder system
 */

class PostService extends AbstractService {
    constructor() {
        super();
        this.dbAdapter = null;
    }

    /**
     * Fetch all posts with status 'draft', 'published', or 'archived' (not deleted)
     * @param {number} limit - Optional limit for results
     * @param {number} offset - Optional offset for pagination
     * @returns {Promise<Array>} Array of posts with allowed statuses
     */

    /**
     * Fetch all posts with given statuses (not deleted)
     * Includes revision draft status and review status in
     * display_state
     * @param {Array<string>} statuses - Array of allowed statuses
     *        (e.g. ['draft','published','archived'])
     * @param {number} limit - Optional limit for results
     * @param {number} offset - Optional offset for pagination
     * @returns {Promise<Array>} Array of posts with allowed statuses
     */
    async getAllPostsWithStatus(
        statuses = ['draft', 'published', 'archived'],
        limit = null,
        offset = null) {
        try {
            const select = await this.getSelectQuery();

            select
                // FROM posts AS p
                .from({ p: 'posts' }, [
                    'p.id',
                    'p.slug',
                    'p.title',
                    'p.updated_at'
                ])

                // Extra columns (category name, updated_by_name,
                // display_state)
                .columns({
                    // Type column in UI (Breaking, Politics, etc.)
                    type: 'c.name',

                    // "Updated By" — fall back to author when
                    // updated_by is null
                    updated_by_name:
                        'COALESCE(u_updated.name, u_author.name)',

                    // Display state badge
                    display_state: `
                        CASE
                          WHEN pr_draft.id IS NOT NULL
                               AND p.status = 'published'
                            THEN 'PUBLISHED - REVISION DRAFT'
                          WHEN p.review_requested = TRUE
                               AND p.status = 'draft'
                            THEN 'DRAFT - IN REVIEW'
                          WHEN p.status = 'draft'
                            THEN 'DRAFT'
                          WHEN p.status = 'published'
                            THEN 'PUBLISHED'
                          ELSE UPPER(p.status)
                        END
                    `
                })

                // JOIN categories c ON c.id = p.category_id
                .join({ c: 'categories' }, 'c.id = p.category_id')

                // LEFT JOIN users u_author ON u_author.id = p.author_id
                .joinLeft({ u_author: 'users' },
                    'u_author.id = p.author_id')

                // LEFT JOIN users u_updated ON u_updated.id =
                // p.updated_by
                .joinLeft({ u_updated: 'users' },
                    'u_updated.id = p.updated_by')

                // LEFT JOIN post_revisions pr_draft
                //   ON pr_draft.post_id = p.id AND
                //      pr_draft.status = 'draft'
                .joinLeft(
                    { pr_draft: 'post_revisions' },
                    "pr_draft.post_id = p.id AND " +
                    "pr_draft.status = 'draft'"
                )

                // WHERE p.deleted_at IS NULL
                // (exclude archived/soft-deleted)
                .where('p.deleted_at IS NULL')

                // Filter by status
                .where('p.status = ANY(?)', [statuses])

                // ORDER BY p.updated_at DESC
                .order('p.updated_at', 'DESC');

            // LIMIT/OFFSET for pagination
            if (limit !== null) {
                select.limit(limit);
            }
            if (offset !== null) {
                select.offset(offset);
            }

            const result = await select.execute();
            return result.rows || result;
        } catch (error) {
            console.error('Error fetching posts with status:',
                statuses, error);
            throw error;
        }
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
     * Fetch all published posts that are not deleted
     * @param {number} limit - Optional limit for results
     * @param {number} offset - Optional offset for pagination
     * @returns {Promise<Array>} Array of published posts
     */
    async getAllPublishedPosts(limit = null, offset = null) {
        try {
            const select = await this.getSelectQuery();
            
            // Build query: SELECT posts with joins for category, author, and presentation styles
            select.from('posts')
                  .joinLeft('categories', 'posts.category_id = categories.id')
                  .joinLeft('users', 'posts.author_id = users.id')
                  .joinLeft('presentation_styles', 'categories.presentation_style_id = presentation_styles.id')
                  .columns([
                      'posts.id',
                      'posts.title',
                      'posts.slug',
                      'posts.excerpt_markdown',
                      'posts.excerpt_html',
                      'posts.content_markdown',
                      'posts.content_html',
                      'posts.hero_image_url',
                      'posts.presentation_style_id',
                      'posts.header_color_override',
                      'posts.is_featured',
                      'posts.created_at',
                      'posts.updated_at',
                      'posts.published_at',
                      'categories.name as category_name',
                      'categories.slug as category_slug',
                      'users.name as author_name',
                      'users.email as author_email',
                      'presentation_styles.name as presentation_style_name',
                      'presentation_styles.slug as presentation_style_slug',
                      'presentation_styles.css_classes as presentation_css_classes'
                  ])
                  .where('posts.status = ?', 'published')
                  .where('posts.deleted_at IS NULL')
                  .order('posts.published_at', 'DESC');

            // Apply pagination if provided
            if (limit !== null) {
                select.limit(limit);
            }
            if (offset !== null) {
                select.offset(offset);
            }

            const result = await select.execute();
            
            return result.rows || result;
        } catch (error) {
            console.error('Error fetching published posts:', error);
            throw error;
        }
    }

    /**
     * Fetch a single post by ID or slug
     * @param {string|number} identifier - Post ID or slug
     * @param {boolean} bySlug - Whether to search by slug (default: false, search by ID)
     * @param {boolean} includeDrafts - Whether to include draft posts (default: false, only published)
     * @returns {Promise<Object|null>} Single post object or null if not found
     */
    async getSinglePost(identifier, bySlug = false, includeDrafts = false) {
        try {
            const select = await this.getSelectQuery();

            // Build query with joins for complete post data
            select.from('posts')
                  .joinLeft('categories', 'posts.category_id = categories.id')
                  .joinLeft('users', 'posts.author_id = users.id')
                  .joinLeft('presentation_styles', 'categories.presentation_style_id = presentation_styles.id')
                  .columns([
                      'posts.*',
                      'categories.name as category_name',
                      'categories.slug as category_slug',
                      'categories.description as category_description',
                      'users.name as author_name',
                      'users.email as author_email',
                      'users.bio as author_bio',
                      'presentation_styles.name as presentation_style_name',
                      'presentation_styles.slug as presentation_style_slug',
                      'presentation_styles.css_classes as presentation_css_classes',
                      'presentation_styles.description as presentation_style_description'
                  ]);

            // Search by slug or ID
            if (bySlug) {
                select.where('posts.slug = ?', identifier);
            } else {
                select.where('posts.id = ?', identifier);
            }

            // Filter by status: published only for public, both published and draft for admin
            if (!includeDrafts) {
                select.where('posts.status = ?', 'published');
            }
            select.where('posts.deleted_at IS NULL');

            const result = await select.execute();

            const rows = result.rows || result;
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error fetching single post:', error);
            throw error;
        }
    }

    /**
     * Fetch 10 most recent published posts for sidebar
     * @param {number} excludePostId - Optional post ID to exclude from results
     * @returns {Promise<Array>} Array of recent posts for sidebar
     */
    async getRecentPostsForSidebar(excludePostId = null) {
        try {
            const select = await this.getSelectQuery();

            // Build query for sidebar posts - minimal data needed
            select.from('posts')
                  .joinLeft('categories', 'posts.category_id = categories.id')
                  .columns([
                      'posts.id',
                      'posts.title',
                      'posts.slug',
                      'posts.excerpt_markdown',
                      'posts.excerpt_html',
                      'posts.hero_image_url',
                      'posts.published_at',
                      'categories.name as category_name',
                      'categories.slug as category_slug'
                  ])
                  .where('posts.status = ?', 'published')
                  .where('posts.deleted_at IS NULL')
                  .order('posts.published_at', 'DESC')
                  .limit(10);

            // Exclude specific post if provided (useful when showing related posts)
            if (excludePostId) {
                select.where('posts.id != ?', excludePostId);
            }

            const result = await select.execute();

            return result.rows || result;
        } catch (error) {
            console.error('Error fetching recent posts for sidebar:', error);
            throw error;
        }
    }

    /**
     * Get posts by category
     * @param {string|number} categoryIdentifier - Category ID or slug
     * @param {boolean} bySlug - Whether to search by slug (default: true)
     * @param {number} limit - Optional limit for results
     * @param {number} offset - Optional offset for pagination
     * @returns {Promise<Array>} Array of posts in category
     */
    async getPostsByCategory(categoryIdentifier, bySlug = true, limit = null, offset = null) {
        try {
            const select = await this.getSelectQuery();

            select.from('posts')
                  .join('categories', 'posts.category_id = categories.id', 'INNER')
                  .joinLeft('users', 'posts.author_id = users.id')
                  .columns([
                      'posts.id',
                      'posts.title',
                      'posts.slug',
                      'posts.excerpt_markdown',
                      'posts.excerpt_html',
                      'posts.hero_image_url',
                      'posts.published_at',
                      'categories.name as category_name',
                      'categories.slug as category_slug',
                      'users.name as author_name'
                  ])
                  .where('posts.status = ?', 'published')
                  .where('posts.deleted_at IS NULL')
                  .order('posts.published_at', 'DESC');

            // Search by category slug or ID
            if (bySlug) {
                select.where('categories.slug = ?', categoryIdentifier);
            } else {
                select.where('categories.id = ?', categoryIdentifier);
            }

            // Apply pagination if provided
            if (limit !== null) {
                select.limit(limit);
            }
            if (offset !== null) {
                select.offset(offset);
            }

            // const statement = select.getStatement();
            const result = await select.execute();

            return result.rows || result;
        } catch (error) {
            console.error('Error fetching posts by category:', error);
            throw error;
        }
    }

    /**
     * Search posts by title or content
     * @param {string} searchTerm - Search term
     * @param {number} limit - Optional limit for results
     * @param {number} offset - Optional offset for pagination
     * @param {boolean} includeDrafts - Whether to include draft posts (default: false, only published)
     * @returns {Promise<Array>} Array of matching posts
     */
    async searchPosts(searchTerm, limit = 20, offset = null, includeDrafts = false) {
        try {
            const select = await this.getSelectQuery();

            select.from('posts')
                  .joinLeft('categories', 'posts.category_id = categories.id')
                  .joinLeft('users', 'posts.author_id = users.id')
                  .columns([
                      'posts.id',
                      'posts.title',
                      'posts.slug',
                      'posts.excerpt_markdown',
                      'posts.excerpt_html',
                      'posts.hero_image_url',
                      'posts.published_at',
                      'categories.name as category_name',
                      'categories.slug as category_slug',
                      'users.name as author_name'
                  ]);

            // Filter by status: published only for public, both published and draft for admin
            if (!includeDrafts) {
                select.where('posts.status = ?', 'published');
            }

            select.where('posts.deleted_at IS NULL')
                  .where(`(posts.title ILIKE '%${searchTerm}%' OR posts.excerpt_markdown ILIKE '%${searchTerm}%' OR posts.content ILIKE '%${searchTerm}%')`)
                  .order('posts.published_at', 'DESC')
                  .limit(limit);

            if (offset !== null) {
                select.offset(offset);
            }

            // const statement = select.getStatement();
            const result = await select.execute();

            return result.rows || result;
        } catch (error) {
            console.error('Error searching posts:', error);
            throw error;
        }
    }

    /**
     * Get post count for pagination
     * @param {Object} filters - Optional filters (category, search, includeDrafts, etc.)
     * @returns {Promise<number>} Total count of posts
     */
    async getPostCount(filters = {}) {
        try {
            const select = await this.getSelectQuery();

            select.from('posts', [])
                  .columns(['COUNT(*) as count']);

            // Filter by status: published only for public, both published and draft for admin
            if (!filters.includeDrafts) {
                select.where('posts.status = ?', 'published');
            }

            select.where('posts.deleted_at IS NULL');

            // Apply filters if provided
            if (filters.categoryId) {
                select.where('posts.category_id = ?', filters.categoryId);
            }

            if (filters.search) {
                select.where(`(posts.title ILIKE '%${filters.search}%' OR posts.excerpt_markdown ILIKE '%${filters.search}%' OR posts.content ILIKE '%${filters.search}%')`);
            }

            const result = await select.execute();

            const rows = result.rows || result;
            return parseInt(rows[0].count) || 0;
        } catch (error) {
            console.error('Error getting post count:', error);
            throw error;
        }
    }

    /**
     * Get the next article (older, published before current article)
     * @param {string} currentPostPublishedAt - Current post's published_at timestamp
     * @param {number} currentPostId - Current post's ID (to exclude it)
     * @returns {Promise<Object|null>} Next article object or null
     */
    async getNextArticle(currentPostPublishedAt, currentPostId) {
        try {
            const select = await this.getSelectQuery();

            select.from('posts')
                  .joinLeft('categories', 'posts.category_id = categories.id')
                  .columns([
                      'posts.id',
                      'posts.title',
                      'posts.slug',
                      'posts.published_at',
                      'categories.slug as category_slug'
                  ])
                  .where('posts.status = ?', 'published')
                  .where('posts.deleted_at IS NULL')
                  .where('posts.published_at < ?', currentPostPublishedAt)
                  .where('posts.id != ?', currentPostId)
                  .order('posts.published_at', 'DESC')
                  .limit(1);

            const result = await select.execute();
            const rows = result.rows || result;
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error fetching next article:', error);
            throw error;
        }
    }

    /**
     * Get the previous article (newer, published after current article)
     * @param {string} currentPostPublishedAt - Current post's published_at timestamp
     * @param {number} currentPostId - Current post's ID (to exclude it)
     * @returns {Promise<Object|null>} Previous article object or null
     */
    async getPreviousArticle(currentPostPublishedAt, currentPostId) {
        try {
            const select = await this.getSelectQuery();

            select.from('posts')
                  .joinLeft('categories', 'posts.category_id = categories.id')
                  .columns([
                      'posts.id',
                      'posts.title',
                      'posts.slug',
                      'posts.published_at',
                      'categories.slug as category_slug'
                  ])
                  .where('posts.status = ?', 'published')
                  .where('posts.deleted_at IS NULL')
                  .where('posts.published_at > ?', currentPostPublishedAt)
                  .where('posts.id != ?', currentPostId)
                  .order('posts.published_at', 'ASC')
                  .limit(1);

            const result = await select.execute();
            const rows = result.rows || result;
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error fetching previous article:', error);
            throw error;
        }
    }

    /**
     * Get all categories (for dropdowns, forms, etc.)
     * @returns {Promise<Array>} Array of category objects with id and name
     */
    async getAllCategories() {
        try {
            const select = await this.getSelectQuery();

            select.from('categories')
                  .columns([
                      'id',
                      'name',
                      'slug',
                      'description'
                  ])
                  .order('sort_order', 'ASC');

            const result = await select.execute();
            return result.rows || result;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    /**
     * Create a new post
     * @param {Object} postData - Post data to insert
     * @returns {Promise<Object>} Created post object with ID
     */
    async createPost(postData) {
        try {
            const adapter = await this.initializeDatabase();
            const Insert = require('../../library/db/sql/insert');
            const insert = new Insert(adapter);

            // Debug: log the data being inserted
            console.log('Data being inserted:', JSON.stringify(postData, null, 2));

            // Build insert query with RETURNING clause for PostgreSQL
            insert.into('posts')
                  .values(postData)
                  .returning('id');

            // Debug: log the generated SQL
            try {
                const statement = insert.getStatement();
                console.log('Generated SQL:', statement);
            } catch (e) {
                console.log('Error getting statement:', e.message);
            }

            // Execute the INSERT query directly via adapter
            const sql = insert.toString();
            const params = insert.parameters;
            const result = await adapter.query(sql, params);

            // PostgreSQL adapter returns an array with the result from RETURNING clause
            let insertedId;
            if (Array.isArray(result) && result.length > 0 && result[0].id) {
                insertedId = result[0].id;
                console.log('Successfully inserted post with ID:', insertedId);
            } else {
                console.error('Unexpected result format from INSERT:', result);
                throw new Error('Failed to retrieve inserted post ID');
            }

            // Return the newly created post
            return await this.getSinglePost(insertedId, false, true);
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    }

    /**
     * Update a post by slug
     * @param {string} slug - Post slug to search by
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated post object
     */
    async updatePostBySlug(slug, updateData) {
        try {
            const adapter = await this.initializeDatabase();
            const Update = require('../../library/db/sql/update');
            const update = new Update(adapter);

            // Build update query
            update.table('posts')
                  .set(updateData)
                  .where('slug = ?', slug)
                  .where('deleted_at IS NULL');

            await update.execute();

            // Return the updated post
            return await this.getSinglePost(slug, true, true);
        } catch (error) {
            console.error('Error updating post by slug:', error);
            throw error;
        }
    }

    /**
     * Update a post by ID
     * @param {number} id - Post ID to search by
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated post object
     */
    async updatePostById(id, updateData) {
        try {
            console.log('[PostService.updatePostById] updateData.comments_enabled:', updateData.comments_enabled, 'type:', typeof updateData.comments_enabled);

            const adapter = await this.initializeDatabase();
            const Update = require('../../library/db/sql/update');
            const update = new Update(adapter);

            // Build update query
            update.table('posts')
                  .set(updateData)
                  .where('id = ?', id)
                  .where('deleted_at IS NULL');

            await update.execute();

            // Return the updated post
            return await this.getSinglePost(id, false, true);
        } catch (error) {
            console.error('Error updating post by ID:', error);
            throw error;
        }
    }

    /**
     * Delete a post by ID (hard delete)
     * Permanently removes the post from the database
     * Use with caution - this cannot be undone
     * @param {number} id - Post ID to delete
     * @returns {Promise<void>}
     */
    async deletePost(id) {
        try {
            const adapter = await this.initializeDatabase();
            const Delete = require('../../library/db/sql/delete');
            const deleteQuery = new Delete(adapter);

            // Build delete query
            deleteQuery.from('posts')
                       .where('id = ?', id);

            await deleteQuery.execute();
        } catch (error) {
            console.error('Error deleting post by ID:', error);
            throw error;
        }
    }

    /**
     * Soft delete a post by ID
     * Sets deleted_at timestamp instead of removing from database
     * @param {number} id - Post ID to soft delete
     * @param {number} deletedBy - User ID who is deleting the post
     * @returns {Promise<Object>} Updated post object
     */
    async softDeletePost(id, deletedBy = null) {
        try {
            const updateData = {
                deleted_at: new Date().toISOString(),
                regenerate_static: true
            };

            if (deletedBy) {
                updateData.deleted_by = deletedBy;
            }

            return await this.updatePostById(id, updateData);
        } catch (error) {
            console.error('Error soft deleting post by ID:', error);
            throw error;
        }
    }

    /**
     * Check if a slug exists in the database
     * @param {string} slug - Slug to check
     * @returns {Promise<boolean>} True if slug exists, false otherwise
     */
    async slugExists(slug) {
        // Check if slug exists using Select query builder
        const select = await this.getSelectQuery();
        select.from('posts')
              .columns(['1'])
              .where('slug = ?', slug)
              .limit(1);

        const result = await select.execute();
        const rows = result.rows || result;

        return rows.length > 0;
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

module.exports = PostService;