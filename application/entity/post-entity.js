const AbstractEntity = require(
    global.applicationPath('/library/core/common/abstract-entity'));
const VarUtil = require(
    global.applicationPath('/library/util/var-util'));
const InputFilter = require(
    global.applicationPath('/library/input-filter/input-filter'));

/**
 * PostEntity - Represents a blog post/article entity with all
 * associated metadata
 * Maps to the 'posts' table in PostgreSQL database
 * Provides complete post lifecycle management including status
 * transitions, validation, and data transformation
 * Supports draft, published, archived workflow with review and approval
 * process
 * Includes SEO metadata, category relationships, hero image management,
 * and comment settings
 * Extends AbstractEntity for common entity functionality (get/set
 * methods)
 * @extends AbstractEntity
 */
class PostEntity extends AbstractEntity {

    /**
     * Constructor
     * Initializes post entity with comprehensive database schema
     * All fields map directly to PostgreSQL 'posts' table columns
     * Sets up default values matching database constraints
     * @param {Object} data - Optional initial data to populate entity
     */
    constructor(data = null) {
        super();

        // Initialize storage with default post structure matching
        // database schema
        this.storage = {
            // Primary key
            id: null,

            // Basic post information
            slug: null,                  // URL-friendly identifier
            title: null,                 // Post title
            excerpt_html: null,          // Short summary (HTML)
            excerpt_markdown: null,      // Short summary (Markdown)
            content_html: null,          // Full content (HTML)
            content_markdown: null,      // Full content (Markdown)

            // Relationships
            author_id: null,             // Foreign key to users table
            category_id: null,           // Foreign key to categories
                                         // table
            presentation_style_id: null, // Foreign key to
                                         // presentation_styles table

            // Display & styling
            header_color_override: null, // Custom header color
            is_featured: false,          // Featured post flag

            // Hero image
            hero_image_url: null,        // Main hero image URL
            hero_image_alt: null,        // Image alt text for
                                         // accessibility
            hero_image_caption: null,    // Image caption
            hero_image_credit: null,     // Image credit/attribution

            // SEO metadata
            meta_title: null,            // SEO title override
            meta_description: null,      // SEO meta description

            // Post settings
            comments_enabled: true,      // Boolean: allow comments
            status: 'draft',             // draft/published/archived
            regenerate_static: false,    // Boolean: regenerate static
                                         // HTML
            review_requested: false,     // Boolean: review requested

            // Timestamps
            published_at: null,          // When post was published
            created_at: null,            // When record was created
            updated_at: null,            // When record was last updated
            deleted_at: null,            // Soft delete timestamp
            approved_at: null,           // When post was approved

            // User tracking
            updated_by: null,            // User ID who last updated
            deleted_by: null,            // User ID who deleted
            approved_by: null,           // User ID who approved
            published_by: null           // User ID who published
        };

        // Populate from data if provided
        if (data) {
            this.exchangeObject(data);
        }
    }

    /**
     * Exchange data from object into this entity
     * Populates entity fields from provided data object
     * Only sets fields that are explicitly defined (not undefined)
     * Preserves default values when data fields are undefined
     * Implements the required AbstractEntity method
     * @param {Object} data - Data to populate entity with
     * @returns {PostEntity} This entity for method chaining
     */
    exchangeObject(data) {
        if (!VarUtil.isObject(data)) {
            return this;
        }

        // Map all properties from data to storage using conditional
        // assignment to preserve defaults when values are undefined

        // Primary key
        if (data.id !== undefined) this.storage.id = data.id;

        // Basic post information
        if (data.slug !== undefined) this.storage.slug = data.slug;
        if (data.title !== undefined) this.storage.title = data.title;
        if (data.excerpt_html !== undefined)
            this.storage.excerpt_html = data.excerpt_html;
        if (data.excerpt_markdown !== undefined)
            this.storage.excerpt_markdown = data.excerpt_markdown;
        if (data.content_html !== undefined)
            this.storage.content_html = data.content_html;
        if (data.content_markdown !== undefined)
            this.storage.content_markdown = data.content_markdown;

        // Relationships
        if (data.author_id !== undefined)
            this.storage.author_id = data.author_id;
        if (data.category_id !== undefined)
            this.storage.category_id = data.category_id;
        if (data.presentation_style_id !== undefined)
            this.storage.presentation_style_id =
                data.presentation_style_id;

        // Display & styling
        if (data.header_color_override !== undefined)
            this.storage.header_color_override =
                data.header_color_override;
        if (data.is_featured !== undefined)
            this.storage.is_featured = data.is_featured;

        // Hero image
        if (data.hero_image_url !== undefined)
            this.storage.hero_image_url = data.hero_image_url;
        if (data.hero_image_alt !== undefined)
            this.storage.hero_image_alt = data.hero_image_alt;
        if (data.hero_image_caption !== undefined)
            this.storage.hero_image_caption = data.hero_image_caption;
        if (data.hero_image_credit !== undefined)
            this.storage.hero_image_credit = data.hero_image_credit;

        // SEO metadata
        if (data.meta_title !== undefined)
            this.storage.meta_title = data.meta_title;
        if (data.meta_description !== undefined)
            this.storage.meta_description = data.meta_description;

        // Post settings
        if (data.comments_enabled !== undefined)
            this.storage.comments_enabled = data.comments_enabled;
        if (data.status !== undefined)
            this.storage.status = data.status;
        if (data.regenerate_static !== undefined)
            this.storage.regenerate_static = data.regenerate_static;
        if (data.review_requested !== undefined)
            this.storage.review_requested = data.review_requested;

        // Timestamps
        if (data.published_at !== undefined)
            this.storage.published_at = data.published_at;
        if (data.created_at !== undefined)
            this.storage.created_at = data.created_at;
        if (data.updated_at !== undefined)
            this.storage.updated_at = data.updated_at;
        if (data.deleted_at !== undefined)
            this.storage.deleted_at = data.deleted_at;
        if (data.approved_at !== undefined)
            this.storage.approved_at = data.approved_at;

        // User tracking
        if (data.updated_by !== undefined)
            this.storage.updated_by = data.updated_by;
        if (data.deleted_by !== undefined)
            this.storage.deleted_by = data.deleted_by;
        if (data.approved_by !== undefined)
            this.storage.approved_by = data.approved_by;
        if (data.published_by !== undefined)
            this.storage.published_by = data.published_by;

        return this;
    }

    /**
     * Get object copy of entity data
     * Returns shallow copy of all entity fields
     * Alias for getArrayCopy to match AbstractEntity interface
     * Used for serialization, database operations, and API responses
     * @returns {Object} Copy of entity storage object
     */
    getObjectCopy() {
        return {
            id: this.storage.id,
            slug: this.storage.slug,
            title: this.storage.title,
            excerpt_html: this.storage.excerpt_html,
            excerpt_markdown: this.storage.excerpt_markdown,
            content_html: this.storage.content_html,
            content_markdown: this.storage.content_markdown,
            author_id: this.storage.author_id,
            category_id: this.storage.category_id,
            presentation_style_id: this.storage.presentation_style_id,
            header_color_override: this.storage.header_color_override,
            is_featured: this.storage.is_featured,
            hero_image_url: this.storage.hero_image_url,
            hero_image_alt: this.storage.hero_image_alt,
            hero_image_caption: this.storage.hero_image_caption,
            hero_image_credit: this.storage.hero_image_credit,
            meta_title: this.storage.meta_title,
            meta_description: this.storage.meta_description,
            comments_enabled: this.storage.comments_enabled,
            status: this.storage.status,
            regenerate_static: this.storage.regenerate_static,
            review_requested: this.storage.review_requested,
            published_at: this.storage.published_at,
            created_at: this.storage.created_at,
            updated_at: this.storage.updated_at,
            deleted_at: this.storage.deleted_at,
            approved_at: this.storage.approved_at,
            updated_by: this.storage.updated_by,
            deleted_by: this.storage.deleted_by,
            approved_by: this.storage.approved_by,
            published_by: this.storage.published_by
        };
    }

    // ================================================================
    // CONVENIENCE GETTERS - Read access to entity fields
    // All getters use AbstractEntity's get() method for consistency
    // ================================================================

    /**
     * Get post ID
     * @returns {number|null} Primary key ID
     */
    getId() {
        return this.get('id');
    }

    /**
     * Get post slug
     * @returns {string|null} URL-friendly post identifier
     */
    getSlug() {
        return this.get('slug');
    }

    /**
     * Get post title
     * @returns {string|null} Post title text
     */
    getTitle() {
        return this.get('title');
    }

    /**
     * Get excerpt HTML
     * @returns {string|null} Post excerpt in HTML format
     */
    getExcerptHtml() {
        return this.get('excerpt_html');
    }

    /**
     * Get excerpt markdown
     * @returns {string|null} Post excerpt in Markdown format
     */
    getExcerptMarkdown() {
        return this.get('excerpt_markdown');
    }

    /**
     * Get content HTML
     * @returns {string|null} Full post content in HTML format
     */
    getContentHtml() {
        return this.get('content_html');
    }

    /**
     * Get content markdown
     * @returns {string|null} Full post content in Markdown format
     */
    getContentMarkdown() {
        return this.get('content_markdown');
    }

    /**
     * Get author ID
     * @returns {number|null} Foreign key to users table
     */
    getAuthorId() {
        return this.get('author_id');
    }

    /**
     * Get category ID
     * @returns {number|null} Foreign key to categories table
     */
    getCategoryId() {
        return this.get('category_id');
    }

    /**
     * Get presentation style ID
     * @returns {number|null} Foreign key to presentation_styles table
     */
    getPresentationStyleId() {
        return this.get('presentation_style_id');
    }

    /**
     * Get post status
     * Returns 'draft' as default if status not explicitly set
     * @returns {string} Current status (draft/published/archived)
     */
    getStatus() {
        return this.get('status', 'draft');
    }

    /**
     * Check if post is published
     * @returns {boolean} True if status is 'published', false otherwise
     */
    isPublished() {
        return this.get('status') === 'published';
    }

    /**
     * Check if post is draft
     * @returns {boolean} True if status is 'draft', false otherwise
     */
    isDraft() {
        return this.get('status') === 'draft';
    }

    /**
     * Check if post is archived
     * @returns {boolean} True if status is 'archived', false otherwise
     */
    isArchived() {
        return this.get('status') === 'archived';
    }

    /**
     * Check if post is featured
     * Returns false as default if is_featured not explicitly set
     * @returns {boolean} True if post is featured, false otherwise
     */
    isFeatured() {
        return this.get('is_featured', false);
    }

    /**
     * Check if comments are enabled
     * Returns true as default if comments_enabled not explicitly set
     * @returns {boolean} True if comments allowed, false otherwise
     */
    areCommentsEnabled() {
        return this.get('comments_enabled', true);
    }

    /**
     * Check if review is requested
     * Returns false as default if review_requested not explicitly set
     * @returns {boolean} True if review requested, false otherwise
     */
    isReviewRequested() {
        return this.get('review_requested', false);
    }

    /**
     * Check if post has been deleted (soft delete)
     * @returns {boolean} True if deleted_at is set, false otherwise
     */
    isDeleted() {
        return this.get('deleted_at') !== null;
    }

    /**
     * Get published date
     * @returns {Date|string|null} Published timestamp
     */
    getPublishedAt() {
        return this.get('published_at');
    }

    /**
     * Get creation date
     * @returns {Date|string|null} Created timestamp
     */
    getCreatedAt() {
        return this.get('created_at');
    }

    /**
     * Get last update date
     * @returns {Date|string|null} Updated timestamp
     */
    getUpdatedAt() {
        return this.get('updated_at');
    }

    /**
     * Get published by user ID
     * @returns {number|null} User ID who published post
     */
    getPublishedBy() {
        return this.get('published_by');
    }

    // ================================================================
    // CONVENIENCE SETTERS - Write access to entity fields
    // All setters use AbstractEntity's set() method for consistency
    // Return this entity for method chaining
    // ================================================================

    /**
     * Set post ID
     * @param {number} id - Primary key ID
     * @returns {PostEntity} This entity for method chaining
     */
    setId(id) {
        return this.set('id', id);
    }

    /**
     * Set post slug
     * @param {string} slug - URL-friendly post identifier
     * @returns {PostEntity} This entity for method chaining
     */
    setSlug(slug) {
        return this.set('slug', slug);
    }

    /**
     * Set post title
     * @param {string} title - Post title text
     * @returns {PostEntity} This entity for method chaining
     */
    setTitle(title) {
        return this.set('title', title);
    }

    /**
     * Set excerpt HTML
     * @param {string} excerptHtml - Post excerpt in HTML format
     * @returns {PostEntity} This entity for method chaining
     */
    setExcerptHtml(excerptHtml) {
        return this.set('excerpt_html', excerptHtml);
    }

    /**
     * Set excerpt markdown
     * @param {string} excerptMarkdown - Post excerpt in Markdown format
     * @returns {PostEntity} This entity for method chaining
     */
    setExcerptMarkdown(excerptMarkdown) {
        return this.set('excerpt_markdown', excerptMarkdown);
    }

    /**
     * Set content HTML
     * @param {string} contentHtml - Full post content in HTML format
     * @returns {PostEntity} This entity for method chaining
     */
    setContentHtml(contentHtml) {
        return this.set('content_html', contentHtml);
    }

    /**
     * Set content markdown
     * @param {string} contentMarkdown - Full post content in Markdown
     *                                   format
     * @returns {PostEntity} This entity for method chaining
     */
    setContentMarkdown(contentMarkdown) {
        return this.set('content_markdown', contentMarkdown);
    }

    /**
     * Set author ID
     * @param {number} authorId - Foreign key to users table
     * @returns {PostEntity} This entity for method chaining
     */
    setAuthorId(authorId) {
        return this.set('author_id', authorId);
    }

    /**
     * Set category ID
     * @param {number} categoryId - Foreign key to categories table
     * @returns {PostEntity} This entity for method chaining
     */
    setCategoryId(categoryId) {
        return this.set('category_id', categoryId);
    }

    /**
     * Set post status
     * Validates that status is one of the allowed values
     * @param {string} status - Status value (draft/published/archived)
     * @returns {PostEntity} This entity for method chaining
     * @throws {Error} If status is not valid
     */
    setStatus(status) {
        const validStatuses = ['draft', 'published', 'archived'];
        if (!validStatuses.includes(status)) {
            throw new Error(
                `Invalid status: ${status}. Must be one of: ` +
                `${validStatuses.join(', ')}`);
        }
        return this.set('status', status);
    }

    /**
     * Publish the post
     * Changes status to 'published' and sets published_at timestamp
     * Sets published_by user ID if provided
     * Marks post for static regeneration
     * @param {number} publishedBy - User ID who published the post
     *                               (optional)
     * @returns {PostEntity} This entity for method chaining
     */
    publish(publishedBy = null) {
        this.set('status', 'published');
        if (!this.get('published_at')) {
            this.set('published_at', new Date().toISOString());
        }
        if (publishedBy) {
            this.set('published_by', publishedBy);
        }
        this.setStatus('published');
        this.setRegenerateStatic(true);

        return this;
    }

    /**
     * Set post as draft
     * Changes status to 'draft' (unpublished state)
     * @returns {PostEntity} This entity for method chaining
     */
    setDraft() {
        return this.set('status', 'draft');
    }

    /**
     * Archive the post
     * Changes status to 'archived', removing from active content
     * @returns {PostEntity} This entity for method chaining
     */
    archive() {
        return this.set('status', 'archived');
    }

    /**
     * Set featured status
     * Marks post as featured (highlighted/promoted content)
     * @param {boolean} featured - Whether post is featured (default:
     *                             true)
     * @returns {PostEntity} This entity for method chaining
     */
    setFeatured(featured = true) {
        return this.set('is_featured', featured);
    }

    /**
     * Enable/disable comments
     * Controls whether readers can comment on this post
     * @param {boolean} enabled - Whether comments are allowed (default:
     *                            false)
     * @returns {PostEntity} This entity for method chaining
     */
    setCommentsEnabled(enabled = false) {
        return this.set('comments_enabled', enabled);
    }

    /**
     * Request review for this post
     * Sets review_requested flag to true
     * Used to signal editorial review needed
     * @returns {PostEntity} This entity for method chaining
     */
    requestReview() {
        return this.set('review_requested', true);
    }

    /**
     * Clear review request
     * Sets review_requested flag to false
     * Used after review is completed or canceled
     * @returns {PostEntity} This entity for method chaining
     */
    clearReviewRequest() {
        return this.set('review_requested', false);
    }

    /**
     * Soft delete the post
     * Sets deleted_at timestamp without removing from database
     * Records user ID who performed deletion
     * @param {number} deletedBy - User ID who deleted the post
     * @returns {PostEntity} This entity for method chaining
     */
    softDelete(deletedBy = null) {
        this.set('deleted_at', new Date().toISOString());
        if (deletedBy) {
            this.set('deleted_by', deletedBy);
        }
        return this;
    }

    /**
     * Restore soft-deleted post
     * Clears deleted_at timestamp and deleted_by user ID
     * Returns post to active state
     * @returns {PostEntity} This entity for method chaining
     */
    restore() {
        this.set('deleted_at', null);
        this.set('deleted_by', null);
        return this;
    }

    /**
     * Set presentation style ID
     * Links post to a presentation style configuration
     * @param {number} presentationStyleId - Foreign key to
     *                                       presentation_styles table
     * @returns {PostEntity} This entity for method chaining
     */
    setPresentationStyleId(presentationStyleId) {
        return this.set('presentation_style_id', presentationStyleId);
    }

    /**
     * Set header color override
     * Allows custom header color for this specific post
     * @param {string} headerColorOverride - CSS color value (hex, rgb,
     *                                       etc.)
     * @returns {PostEntity} This entity for method chaining
     */
    setHeaderColorOverride(headerColorOverride) {
        return this.set('header_color_override', headerColorOverride);
    }

    /**
     * Set hero image URL
     * Main hero/featured image for the post
     * @param {string} heroImageUrl - URL to hero image
     * @returns {PostEntity} This entity for method chaining
     */
    setHeroImageUrl(heroImageUrl) {
        return this.set('hero_image_url', heroImageUrl);
    }

    /**
     * Set hero image alt text
     * Alternative text for accessibility (screen readers)
     * @param {string} heroImageAlt - Alt text description
     * @returns {PostEntity} This entity for method chaining
     */
    setHeroImageAlt(heroImageAlt) {
        return this.set('hero_image_alt', heroImageAlt);
    }

    /**
     * Set hero image caption
     * Caption text displayed with hero image
     * @param {string} heroImageCaption - Caption text
     * @returns {PostEntity} This entity for method chaining
     */
    setHeroImageCaption(heroImageCaption) {
        return this.set('hero_image_caption', heroImageCaption);
    }

    /**
     * Set hero image credit
     * Photo credit or attribution for hero image
     * @param {string} heroImageCredit - Credit/attribution text
     * @returns {PostEntity} This entity for method chaining
     */
    setHeroImageCredit(heroImageCredit) {
        return this.set('hero_image_credit', heroImageCredit);
    }

    /**
     * Set meta title
     * SEO meta title override (used in <title> tag)
     * @param {string} metaTitle - SEO title text
     * @returns {PostEntity} This entity for method chaining
     */
    setMetaTitle(metaTitle) {
        return this.set('meta_title', metaTitle);
    }

    /**
     * Set meta description
     * SEO meta description (used in <meta name="description"> tag)
     * @param {string} metaDescription - SEO description text
     * @returns {PostEntity} This entity for method chaining
     */
    setMetaDescription(metaDescription) {
        return this.set('meta_description', metaDescription);
    }

    /**
     * Set regenerate static flag
     * Marks post for static HTML regeneration on next build
     * @param {boolean} regenerateStatic - Whether to regenerate static
     *                                     HTML (default: true)
     * @returns {PostEntity} This entity for method chaining
     */
    setRegenerateStatic(regenerateStatic = true) {
        return this.set('regenerate_static', regenerateStatic);
    }

    /**
     * Set review requested flag
     * Marks post as needing editorial review
     * @param {boolean} reviewRequested - Whether review is requested
     *                                    (default: true)
     * @returns {PostEntity} This entity for method chaining
     */
    setReviewRequested(reviewRequested = true) {
        return this.set('review_requested', reviewRequested);
    }

    /**
     * Set published at timestamp
     * Records when post was published
     * @param {Date|string} publishedAt - Published timestamp
     * @returns {PostEntity} This entity for method chaining
     */
    setPublishedAt(publishedAt) {
        return this.set('published_at', publishedAt);
    }

    /**
     * Set created at timestamp
     * Records when post was created
     * @param {Date|string} createdAt - Created timestamp
     * @returns {PostEntity} This entity for method chaining
     */
    setCreatedAt(createdAt) {
        return this.set('created_at', createdAt);
    }

    /**
     * Set updated at timestamp
     * Records when post was last updated
     * @param {Date|string} updatedAt - Updated timestamp
     * @returns {PostEntity} This entity for method chaining
     */
    setUpdatedAt(updatedAt) {
        return this.set('updated_at', updatedAt);
    }

    /**
     * Set deleted at timestamp
     * Records when post was soft-deleted
     * @param {Date|string} deletedAt - Deleted timestamp
     * @returns {PostEntity} This entity for method chaining
     */
    setDeletedAt(deletedAt) {
        return this.set('deleted_at', deletedAt);
    }

    /**
     * Set approved at timestamp
     * Records when post was approved by editor
     * @param {Date|string} approvedAt - Approved timestamp
     * @returns {PostEntity} This entity for method chaining
     */
    setApprovedAt(approvedAt) {
        return this.set('approved_at', approvedAt);
    }

    /**
     * Set updated by user ID
     * Records which user last updated the post
     * @param {number} updatedBy - User ID who updated
     * @returns {PostEntity} This entity for method chaining
     */
    setUpdatedBy(updatedBy) {
        return this.set('updated_by', updatedBy);
    }

    /**
     * Set deleted by user ID
     * Records which user deleted the post
     * @param {number} deletedBy - User ID who deleted
     * @returns {PostEntity} This entity for method chaining
     */
    setDeletedBy(deletedBy) {
        return this.set('deleted_by', deletedBy);
    }

    /**
     * Set approved by user ID
     * Records which user approved the post
     * @param {number} approvedBy - User ID who approved
     * @returns {PostEntity} This entity for method chaining
     */
    setApprovedBy(approvedBy) {
        return this.set('approved_by', approvedBy);
    }

    /**
     * Set published by user ID
     * Records which user published the post
     * @param {number} publishedBy - User ID who published
     * @returns {PostEntity} This entity for method chaining
     */
    setPublishedBy(publishedBy) {
        return this.set('published_by', publishedBy);
    }

    /**
     * Approve the post
     * Sets approved_by user ID, approved_at timestamp, and clears
     * review_requested flag
     * Used in editorial workflow to mark post as reviewed and approved
     * @param {number} approvedBy - User ID who approved the post
     * @returns {PostEntity} This entity for method chaining
     */
    approve(approvedBy) {
        this.set('approved_by', approvedBy);
        this.set('approved_at', new Date().toISOString());
        this.set('review_requested', false);
        return this;
    }

    // ================================================================
    // VALIDATION METHODS - InputFilter configuration and validation
    // ================================================================

    /**
     * Get the InputFilter for validation
     * Creates a new InputFilter if not already set
     * Configures comprehensive validation rules for all editable fields
     * Includes required field checks, string length limits, and data
     * type validation
     * Uses filters to clean/normalize input (trim, strip tags, HTML
     * entities)
     * @returns {InputFilter} Configured input filter instance
     */
    getInputFilter() {
        if (!this.inputFilter) {
            this.inputFilter = InputFilter.factory({
                'author_id': {
                    required: true,
                    requiredMessage: "author_id",
                    filters: [
                        { name: 'HtmlEntities' },
                        { name: 'StringTrim' },
                        { name: 'StripTags' }
                    ]
                },
                'slug': {
                    required: true,
                    requiredMessage: "Required, non-empty field",
                    filters: [
                        { name: 'HtmlEntities' },
                        { name: 'StringTrim' },
                        { name: 'StripTags' }
                    ],
                    validators: [
                        {
                            name: 'AlphaNumeric',
                            options: {
                                name: 'slug',
                                allowDashAndUnderscore: true,
                                messageTemplate: {
                                    INVALID_FORMAT:
                                        'Slug must contain only ' +
                                        'alphanumeric characters, ' +
                                        'hyphens, and underscores'
                                }
                            }
                        }
                    ]
                },
                'title': {
                    required: true,
                    requiredMessage:
                        "<strong>Title</strong> is required. Please " +
                        "enter a title.",
                    filters: [
                        { name: 'HtmlEntities' },
                        { name: 'StringTrim' },
                        { name: 'StripTags' }
                    ],
                    validators: [
                        {
                            name: 'StringLength',
                            options: {
                                name: "title",
                                min: 20,
                                max: 150,
                                messageTemplate: {
                                    INVALID_TOO_SHORT:
                                        'Title must be at least 20 ' +
                                        'characters long',
                                    INVALID_TOO_LONG:
                                        'Title must not exceed 150 ' +
                                        'characters'
                                }
                            }
                        }
                    ]
                },
                'excerpt_markdown': {
                    required: false,
                    requiredMessage: "excerpt_markdown",
                    filters: [
                        { name: 'HtmlEntities' },
                        { name: 'StringTrim' },
                        { name: 'StripTags' }
                    ],
                    validators: [
                        {
                            name: 'StringLength',
                            options: {
                                name: "excerpt",
                                max: 150,
                                messageTemplate: {
                                    INVALID_TOO_LONG:
                                        '<strong>Excerpt</strong> must ' +
                                        'not exceed 150 characters'
                                }
                            }
                        }
                    ]
                },
                'content_markdown': {
                    required: true,
                    requiredMessage:
                        "<strong>Content</strong> is required. Please " +
                        "enter content",
                    filters: [
                        { name: 'HtmlEntities' },
                        { name: 'StringTrim' },
                        { name: 'StripTags' }
                    ]
                },
                'excerpt_html': {
                    required: false,
                    requiredMessage: "excerpt_html",
                    filters: [
                        { name: 'HtmlEntities' },
                        { name: 'StringTrim' },
                        { name: 'StripTags' }
                    ],
                    validators: [
                        {
                            name: 'StringLength',
                            options: {
                                name: "excerpt",
                                max: 150,
                                messageTemplate: {
                                    INVALID_TOO_LONG:
                                        'Excerpt must not exceed 150 ' +
                                        'characters'
                                }
                            }
                        }
                    ]
                },
                'content_html': {
                    required: true,
                    requiredMessage:
                        "Content is required. Please enter content"
                },
                'category_id': {
                    required: true,
                    requiredMessage:
                        "Category is required. Please select a category",
                    filters: [
                        { name: 'HtmlEntities' },
                        { name: 'StringTrim' },
                        { name: 'StripTags' }
                    ],
                    validators: [
                        {
                            name: 'Integer',
                            options: {},
                            messages: {
                                INVALID:
                                    'Please select a valid category'
                            }
                        }
                    ]
                },
                'updated_by': {
                    required: true,
                    requiredMessage: "Updated by user is required.",
                    filters: [
                        { name: 'HtmlEntities' },
                        { name: 'StringTrim' },
                        { name: 'StripTags' }
                    ],
                    validators: [
                        {
                            name: 'Integer',
                            options: {},
                            messages: {
                                INVALID: 'Please provide user id'
                            }
                        }
                    ]
                }
            });
            // InputFilter configured with comprehensive validation rules
        }
        return this.inputFilter;
    }

    /**
     * Set the InputFilter for validation
     * Allows custom InputFilter to be injected
     * @param {InputFilter} inputFilter - The InputFilter instance to use
     * @returns {PostEntity} This entity for method chaining
     */
    setInputFilter(inputFilter) {
        this.inputFilter = inputFilter;
        return this;
    }

    /**
     * Validate the post entity
     * Uses the InputFilter to validate entity data against defined rules
     * Runs all validators and filters on current entity data
     * @returns {boolean} True if validation passes, false if any
     *                    validation errors
     */
    isValid() {
        const inputFilter = this.getInputFilter();
        inputFilter.setData(this.getObjectCopy());
        return inputFilter.isValid();
    }

    // ================================================================
    // UTILITY METHODS - Data transformation and helper functions
    // ================================================================

    /**
     * Get data prepared for database insertion or update
     * Removes null id for INSERT operations
     * For UPDATE: removes null/undefined fields to avoid overwriting
     * existing data
     * For INSERT: converts undefined values to null for PostgreSQL
     * compatibility
     * @param {boolean} forUpdate - If true, includes id for UPDATE
     *                              queries; if false, excludes id for
     *                              INSERT
     * @returns {Object} Data object ready for database operation
     */
    getDataForDatabase(forUpdate = false) {
        const data = this.getObjectCopy();

        console.log('[PostEntity.getDataForDatabase] BEFORE processing, comments_enabled:', data.comments_enabled, 'type:', typeof data.comments_enabled);

        // Remove id for INSERT operations (database auto-generates)
        if (!forUpdate) {
            delete data.id;
        }

        // For UPDATE operations, remove null values to avoid overwriting
        // existing data with nulls (only update fields that were
        // explicitly set)
        if (forUpdate) {
            Object.keys(data).forEach(key => {
                if (data[key] === null || data[key] === undefined) {
                    delete data[key];
                }
            });
        } else {
            // For INSERT operations, convert undefined values to null
            // for PostgreSQL compatibility
            Object.keys(data).forEach(key => {
                if (data[key] === undefined) {
                    data[key] = null;
                }
            });
        }

        console.log('[PostEntity.getDataForDatabase] AFTER processing, comments_enabled:', data.comments_enabled, 'type:', typeof data.comments_enabled);

        // Note: created_at and updated_at are handled by database
        // triggers

        return data;
    }

    /**
     * Prepare data for form display
     * Returns only fields that should be shown in forms
     * Excludes internal/system fields like timestamps and user tracking
     * @returns {Object} Data object suitable for form population
     */
    getDataForForm() {
        return {
            id: this.get('id'),
            slug: this.get('slug'),
            title: this.get('title'),
            excerpt_markdown: this.get('excerpt_markdown'),
            content_markdown: this.get('content_markdown'),
            author_id: this.get('author_id'),
            category_id: this.get('category_id'),
            presentation_style_id: this.get('presentation_style_id'),
            header_color_override: this.get('header_color_override'),
            is_featured: this.get('is_featured'),
            hero_image_url: this.get('hero_image_url'),
            hero_image_alt: this.get('hero_image_alt'),
            hero_image_caption: this.get('hero_image_caption'),
            hero_image_credit: this.get('hero_image_credit'),
            meta_title: this.get('meta_title'),
            meta_description: this.get('meta_description'),
            comments_enabled: this.get('comments_enabled'),
            status: this.get('status')
        };
    }

    /**
     * Check if post has required fields for publishing
     * Validates that all essential fields are populated before publish
     * @returns {boolean} True if post can be published, false if
     *                    missing required fields
     */
    canBePublished() {
        return !!(
            this.get('title') &&
            this.get('slug') &&
            this.get('content_html') &&
            this.get('category_id')
        );
    }

    /**
     * Get validation errors for publishing
     * Returns array of human-readable error messages for missing
     * required fields
     * Used to provide feedback when publish validation fails
     * @returns {string[]} Array of error messages (empty if all
     *                     required fields present)
     */
    getPublishValidationErrors() {
        const errors = [];

        if (!this.get('title')) {
            errors.push('Title is required');
        }
        if (!this.get('slug')) {
            errors.push('Slug is required');
        }
        if (!this.get('content_html')) {
            errors.push('Content is required');
        }
        if (!this.get('category_id')) {
            errors.push('Category is required');
        }

        return errors;
    }
}

module.exports = PostEntity;
