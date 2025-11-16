const AbstractService = require('./abstractService');

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
            const AdapterClass = require(`../../library/db/adapter/${adapterName}Adapter`);
            
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
        const Select = require('../../library/db/select');
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
                  .joinLeft('presentation_styles', 'posts.presentation_style_id = presentation_styles.id')
                  .columns([
                      'posts.id',
                      'posts.title',
                      'posts.slug',
                      'posts.excerpt',
                      'posts.content',
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
     * @returns {Promise<Object|null>} Single post object or null if not found
     */
    async getSinglePost(identifier, bySlug = false) {
        try {
            const select = await this.getSelectQuery();
            
            // Build query with joins for complete post data
            select.from('posts')
                  .joinLeft('categories', 'posts.category_id = categories.id')
                  .joinLeft('users', 'posts.author_id = users.id')
                  .joinLeft('presentation_styles', 'posts.presentation_style_id = presentation_styles.id')
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

            // Only show published posts for public access
            // Remove this line if you want to fetch drafts as well for admin
            select.where('posts.status = ?', 'published');

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
                      'posts.excerpt',
                      'posts.hero_image_url',
                      'posts.published_at',
                      'categories.name as category_name',
                      'categories.slug as category_slug'
                  ])
                  .where('posts.status = ?', 'published')
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
                      'posts.excerpt',
                      'posts.hero_image_url',
                      'posts.published_at',
                      'categories.name as category_name',
                      'categories.slug as category_slug',
                      'users.name as author_name'
                  ])
                  .where('posts.status = ?', 'published')
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
     * @returns {Promise<Array>} Array of matching posts
     */
    async searchPosts(searchTerm, limit = 20, offset = null) {
        try {
            const select = await this.getSelectQuery();
            
            select.from('posts')
                  .joinLeft('categories', 'posts.category_id = categories.id')
                  .joinLeft('users', 'posts.author_id = users.id')
                  .columns([
                      'posts.id',
                      'posts.title',
                      'posts.slug',
                      'posts.excerpt',
                      'posts.hero_image_url',
                      'posts.published_at',
                      'categories.name as category_name',
                      'categories.slug as category_slug',
                      'users.name as author_name'
                  ])
                  .where('posts.status = ?', 'published')
                  .where(`(posts.title ILIKE '%${searchTerm}%' OR posts.excerpt ILIKE '%${searchTerm}%' OR posts.content ILIKE '%${searchTerm}%')`)
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
     * @param {Object} filters - Optional filters (category, search, etc.)
     * @returns {Promise<number>} Total count of posts
     */
    async getPostCount(filters = {}) {
        try {
            const select = await this.getSelectQuery();
            
            select.from('posts', [])
                  .columns(['COUNT(*) as count'])
                  .where('posts.status = ?', 'published');

            // Apply filters if provided
            if (filters.categoryId) {
                select.where('posts.category_id = ?', filters.categoryId);
            }
            
            if (filters.search) {
                select.where(`(posts.title ILIKE '%${filters.search}%' OR posts.excerpt ILIKE '%${filters.search}%' OR posts.content ILIKE '%${filters.search}%')`);
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