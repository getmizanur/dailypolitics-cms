const AbstractEntity = require(global.applicationPath('/library/core/common/abstract-entity'));
const VarUtil = require(global.applicationPath('/library/util/var-util'));
const InputFilter = require(global.applicationPath('/library/input-filter/input-filter'));

/**
 * PostEntity
 * Represents a blog post/article entity with all associated metadata
 * Maps to the 'posts' table in PostgreSQL database
 *
 * @extends AbstractEntity
 */
class PostEntity extends AbstractEntity {

    constructor(data = null) {
        super();

        // Initialize storage with default post structure matching database schema
        this.storage = {
            // Primary key
            id: null,

            // Basic post information
            slug: null,
            title: null,
            excerpt_html: null,
            excerpt_markdown: null,
            content_html: null,
            content_markdown: null,

            // Relationships
            author_id: null,
            category_id: null,
            presentation_style_id: null,

            // Display & styling
            header_color_override: null,
            is_featured: false,

            // Hero image
            hero_image_url: null,
            hero_image_alt: null,
            hero_image_caption: null,
            hero_image_credit: null,

            // SEO metadata
            meta_title: null,
            meta_description: null,

            // Post settings
            comments_enabled: true,
            status: 'draft', // 'draft', 'published', 'archived'
            regenerate_static: false,
            review_requested: false,

            // Timestamps
            published_at: null,
            created_at: null,
            updated_at: null,
            deleted_at: null,
            approved_at: null,

            // User tracking
            updated_by: null,
            deleted_by: null,
            approved_by: null,
            published_by: null
        };

        // Populate from data if provided
        if (data) {
            this.exchangeObject(data);
        }
    }

    /**
     * Exchange data from object into this entity
     * Implements the required abstract method
     *
     * @param {Object} data - Data to populate entity with
     * @returns {PostEntity} - Returns this for method chaining
     */
    exchangeObject(data) {
        if (!VarUtil.isObject(data)) {
            return this;
        }

        // Map all properties from data to storage
        // Using conditional assignment to preserve defaults when values are undefined

        // Primary key
        if (data.id !== undefined) this.storage.id = data.id;

        // Basic post information
        if (data.slug !== undefined) this.storage.slug = data.slug;
        if (data.title !== undefined) this.storage.title = data.title;
        if (data.excerpt_html !== undefined) this.storage.excerpt_html = data.excerpt_html;
        if (data.excerpt_markdown !== undefined) this.storage.excerpt_markdown = data.excerpt_markdown;
        if (data.content_html !== undefined) this.storage.content_html = data.content_html;
        if (data.content_markdown !== undefined) this.storage.content_markdown = data.content_markdown;

        // Relationships
        if (data.author_id !== undefined) this.storage.author_id = data.author_id;
        if (data.category_id !== undefined) this.storage.category_id = data.category_id;
        if (data.presentation_style_id !== undefined) this.storage.presentation_style_id = data.presentation_style_id;

        // Display & styling
        if (data.header_color_override !== undefined) this.storage.header_color_override = data.header_color_override;
        if (data.is_featured !== undefined) this.storage.is_featured = data.is_featured;

        // Hero image
        if (data.hero_image_url !== undefined) this.storage.hero_image_url = data.hero_image_url;
        if (data.hero_image_alt !== undefined) this.storage.hero_image_alt = data.hero_image_alt;
        if (data.hero_image_caption !== undefined) this.storage.hero_image_caption = data.hero_image_caption;
        if (data.hero_image_credit !== undefined) this.storage.hero_image_credit = data.hero_image_credit;

        // SEO metadata
        if (data.meta_title !== undefined) this.storage.meta_title = data.meta_title;
        if (data.meta_description !== undefined) this.storage.meta_description = data.meta_description;

        // Post settings
        if (data.comments_enabled !== undefined) this.storage.comments_enabled = data.comments_enabled;
        if (data.status !== undefined) this.storage.status = data.status;
        if (data.regenerate_static !== undefined) this.storage.regenerate_static = data.regenerate_static;
        if (data.review_requested !== undefined) this.storage.review_requested = data.review_requested;

        // Timestamps
        if (data.published_at !== undefined) this.storage.published_at = data.published_at;
        if (data.created_at !== undefined) this.storage.created_at = data.created_at;
        if (data.updated_at !== undefined) this.storage.updated_at = data.updated_at;
        if (data.deleted_at !== undefined) this.storage.deleted_at = data.deleted_at;
        if (data.approved_at !== undefined) this.storage.approved_at = data.approved_at;

        // User tracking
        if (data.updated_by !== undefined) this.storage.updated_by = data.updated_by;
        if (data.deleted_by !== undefined) this.storage.deleted_by = data.deleted_by;
        if (data.approved_by !== undefined) this.storage.approved_by = data.approved_by;
        if (data.published_by !== undefined) this.storage.published_by = data.published_by;

        return this;
    }

    /**
     * Alias for getArrayCopy to match AbstractEntity interface
     * @returns {Object}
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

    // ==================== Convenience Getters ====================

    /**
     * Get post ID
     * @returns {number|null}
     */
    getId() {
        return this.get('id');
    }

    /**
     * Get post slug
     * @returns {string|null}
     */
    getSlug() {
        return this.get('slug');
    }

    /**
     * Get post title
     * @returns {string|null}
     */
    getTitle() {
        return this.get('title');
    }

    /**
     * Get excerpt HTML
     * @returns {string|null}
     */
    getExcerptHtml() {
        return this.get('excerpt_html');
    }

    /**
     * Get excerpt markdown
     * @returns {string|null}
     */
    getExcerptMarkdown() {
        return this.get('excerpt_markdown');
    }

    /**
     * Get content HTML
     * @returns {string|null}
     */
    getContentHtml() {
        return this.get('content_html');
    }

    /**
     * Get content markdown
     * @returns {string|null}
     */
    getContentMarkdown() {
        return this.get('content_markdown');
    }

    /**
     * Get author ID
     * @returns {number|null}
     */
    getAuthorId() {
        return this.get('author_id');
    }

    /**
     * Get category ID
     * @returns {number|null}
     */
    getCategoryId() {
        return this.get('category_id');
    }

    /**
     * Get presentation style ID
     * @returns {number|null}
     */
    getPresentationStyleId() {
        return this.get('presentation_style_id');
    }

    /**
     * Get post status
     * @returns {string} - 'draft', 'published', or 'archived'
     */
    getStatus() {
        return this.get('status', 'draft');
    }

    /**
     * Check if post is published
     * @returns {boolean}
     */
    isPublished() {
        return this.get('status') === 'published';
    }

    /**
     * Check if post is draft
     * @returns {boolean}
     */
    isDraft() {
        return this.get('status') === 'draft';
    }

    /**
     * Check if post is archived
     * @returns {boolean}
     */
    isArchived() {
        return this.get('status') === 'archived';
    }

    /**
     * Check if post is featured
     * @returns {boolean}
     */
    isFeatured() {
        return this.get('is_featured', false);
    }

    /**
     * Check if comments are enabled
     * @returns {boolean}
     */
    areCommentsEnabled() {
        return this.get('comments_enabled', true);
    }

    /**
     * Check if review is requested
     * @returns {boolean}
     */
    isReviewRequested() {
        return this.get('review_requested', false);
    }

    /**
     * Check if post has been deleted (soft delete)
     * @returns {boolean}
     */
    isDeleted() {
        return this.get('deleted_at') !== null;
    }

    /**
     * Get published date
     * @returns {Date|string|null}
     */
    getPublishedAt() {
        return this.get('published_at');
    }

    /**
     * Get creation date
     * @returns {Date|string|null}
     */
    getCreatedAt() {
        return this.get('created_at');
    }

    /**
     * Get last update date
     * @returns {Date|string|null}
     */
    getUpdatedAt() {
        return this.get('updated_at');
    }

    /**
     * Get published by user ID
     * @returns {number|null}
     */
    getPublishedBy() {
        return this.get('published_by');
    }

    // ==================== Convenience Setters ====================

    /**
     * Set post ID
     * @param {number} id
     * @returns {PostEntity}
     */
    setId(id) {
        return this.set('id', id);
    }

    /**
     * Set post slug
     * @param {string} slug
     * @returns {PostEntity}
     */
    setSlug(slug) {
        return this.set('slug', slug);
    }

    /**
     * Set post title
     * @param {string} title
     * @returns {PostEntity}
     */
    setTitle(title) {
        return this.set('title', title);
    }

    /**
     * Set excerpt HTML
     * @param {string} excerptHtml
     * @returns {PostEntity}
     */
    setExcerptHtml(excerptHtml) {
        return this.set('excerpt_html', excerptHtml);
    }

    /**
     * Set excerpt markdown
     * @param {string} excerptMarkdown
     * @returns {PostEntity}
     */
    setExcerptMarkdown(excerptMarkdown) {
        return this.set('excerpt_markdown', excerptMarkdown);
    }

    /**
     * Set content HTML
     * @param {string} contentHtml
     * @returns {PostEntity}
     */
    setContentHtml(contentHtml) {
        return this.set('content_html', contentHtml);
    }

    /**
     * Set content markdown
     * @param {string} contentMarkdown
     * @returns {PostEntity}
     */
    setContentMarkdown(contentMarkdown) {
        return this.set('content_markdown', contentMarkdown);
    }

    /**
     * Set author ID
     * @param {number} authorId
     * @returns {PostEntity}
     */
    setAuthorId(authorId) {
        return this.set('author_id', authorId);
    }

    /**
     * Set category ID
     * @param {number} categoryId
     * @returns {PostEntity}
     */
    setCategoryId(categoryId) {
        return this.set('category_id', categoryId);
    }

    /**
     * Set post status
     * @param {string} status - 'draft', 'published', or 'archived'
     * @returns {PostEntity}
     */
    setStatus(status) {
        const validStatuses = ['draft', 'published', 'archived'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
        }
        return this.set('status', status);
    }

    /**
     * Publish the post
     * @param {number} publishedBy - User ID who published the post (optional)
     * @returns {PostEntity}
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
     * @returns {PostEntity}
     */
    setDraft() {
        return this.set('status', 'draft');
    }

    /**
     * Archive the post
     * @returns {PostEntity}
     */
    archive() {
        return this.set('status', 'archived');
    }

    /**
     * Set featured status
     * @param {boolean} featured
     * @returns {PostEntity}
     */
    setFeatured(featured = true) {
        return this.set('is_featured', featured);
    }

    /**
     * Enable/disable comments
     * @param {boolean} enabled
     * @returns {PostEntity}
     */
    setCommentsEnabled(enabled = false) {
        return this.set('comments_enabled', enabled);
    }

    /**
     * Request review for this post
     * @returns {PostEntity}
     */
    requestReview() {
        return this.set('review_requested', true);
    }

    /**
     * Clear review request
     * @returns {PostEntity}
     */
    clearReviewRequest() {
        return this.set('review_requested', false);
    }

    /**
     * Soft delete the post
     * @param {number} deletedBy - User ID who deleted the post
     * @returns {PostEntity}
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
     * @returns {PostEntity}
     */
    restore() {
        this.set('deleted_at', null);
        this.set('deleted_by', null);
        return this;
    }

    /**
     * Set presentation style ID
     * @param {number} presentationStyleId
     * @returns {PostEntity}
     */
    setPresentationStyleId(presentationStyleId) {
        return this.set('presentation_style_id', presentationStyleId);
    }

    /**
     * Set header color override
     * @param {string} headerColorOverride
     * @returns {PostEntity}
     */
    setHeaderColorOverride(headerColorOverride) {
        return this.set('header_color_override', headerColorOverride);
    }

    /**
     * Set hero image URL
     * @param {string} heroImageUrl
     * @returns {PostEntity}
     */
    setHeroImageUrl(heroImageUrl) {
        return this.set('hero_image_url', heroImageUrl);
    }

    /**
     * Set hero image alt text
     * @param {string} heroImageAlt
     * @returns {PostEntity}
     */
    setHeroImageAlt(heroImageAlt) {
        return this.set('hero_image_alt', heroImageAlt);
    }

    /**
     * Set hero image caption
     * @param {string} heroImageCaption
     * @returns {PostEntity}
     */
    setHeroImageCaption(heroImageCaption) {
        return this.set('hero_image_caption', heroImageCaption);
    }

    /**
     * Set hero image credit
     * @param {string} heroImageCredit
     * @returns {PostEntity}
     */
    setHeroImageCredit(heroImageCredit) {
        return this.set('hero_image_credit', heroImageCredit);
    }

    /**
     * Set meta title
     * @param {string} metaTitle
     * @returns {PostEntity}
     */
    setMetaTitle(metaTitle) {
        return this.set('meta_title', metaTitle);
    }

    /**
     * Set meta description
     * @param {string} metaDescription
     * @returns {PostEntity}
     */
    setMetaDescription(metaDescription) {
        return this.set('meta_description', metaDescription);
    }

    /**
     * Set regenerate static flag
     * @param {boolean} regenerateStatic
     * @returns {PostEntity}
     */
    setRegenerateStatic(regenerateStatic = true) {
        return this.set('regenerate_static', regenerateStatic);
    }

    /**
     * Set review requested flag
     * @param {boolean} reviewRequested
     * @returns {PostEntity}
     */
    setReviewRequested(reviewRequested = true) {
        return this.set('review_requested', reviewRequested);
    }

    /**
     * Set published at timestamp
     * @param {Date|string} publishedAt
     * @returns {PostEntity}
     */
    setPublishedAt(publishedAt) {
        return this.set('published_at', publishedAt);
    }

    /**
     * Set created at timestamp
     * @param {Date|string} createdAt
     * @returns {PostEntity}
     */
    setCreatedAt(createdAt) {
        return this.set('created_at', createdAt);
    }

    /**
     * Set updated at timestamp
     * @param {Date|string} updatedAt
     * @returns {PostEntity}
     */
    setUpdatedAt(updatedAt) {
        return this.set('updated_at', updatedAt);
    }

    /**
     * Set deleted at timestamp
     * @param {Date|string} deletedAt
     * @returns {PostEntity}
     */
    setDeletedAt(deletedAt) {
        return this.set('deleted_at', deletedAt);
    }

    /**
     * Set approved at timestamp
     * @param {Date|string} approvedAt
     * @returns {PostEntity}
     */
    setApprovedAt(approvedAt) {
        return this.set('approved_at', approvedAt);
    }

    /**
     * Set updated by user ID
     * @param {number} updatedBy
     * @returns {PostEntity}
     */
    setUpdatedBy(updatedBy) {
        return this.set('updated_by', updatedBy);
    }

    /**
     * Set deleted by user ID
     * @param {number} deletedBy
     * @returns {PostEntity}
     */
    setDeletedBy(deletedBy) {
        return this.set('deleted_by', deletedBy);
    }

    /**
     * Set approved by user ID
     * @param {number} approvedBy
     * @returns {PostEntity}
     */
    setApprovedBy(approvedBy) {
        return this.set('approved_by', approvedBy);
    }

    /**
     * Set published by user ID
     * @param {number} publishedBy
     * @returns {PostEntity}
     */
    setPublishedBy(publishedBy) {
        return this.set('published_by', publishedBy);
    }

    /**
     * Approve the post
     * @param {number} approvedBy - User ID who approved the post
     * @returns {PostEntity}
     */
    approve(approvedBy) {
        this.set('approved_by', approvedBy);
        this.set('approved_at', new Date().toISOString());
        this.set('review_requested', false);
        return this;
    }

    // ==================== Validation Methods ====================

    /**
     * Get the InputFilter for validation
     * Creates a new InputFilter if not already set
     * @returns {InputFilter}
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
                                    INVALID_FORMAT: 'Slug must contain only alphanumeric characters, hyphens, and underscores'
                                }
                            }
                        }
                    ]
                },
                'title': {
                    required: true,
                    requiredMessage: "<strong>Title</strong> is required. Please enter a title.",
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
                                    INVALID_TOO_SHORT: 'Title must be at least 20 characters long',
                                    INVALID_TOO_LONG: 'Title must not exceed 150 characters'
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
                                    INVALID_TOO_LONG: '<strong>Excerpt</strong> must not exceed 150 characters'
                                }
                            }
                        }
                    ]
                },
                'content_markdown': {
                    required: true,
                    requiredMessage: "<strong>Content</strong> is required. Please enter content",
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
                                    INVALID_TOO_LONG: 'Excerpt must not exceed 150 characters'
                                }
                            }
                        }
                    ]
                },
                'content_html': {
                    required: true,
                    requiredMessage: "Content is required. Please enter content"
                },
                'category_id': {
                    required: true,
                    requiredMessage: "Category is required. Please select a category",
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
                                INVALID: 'Please select a valid category'
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
            // You can configure validation rules here if needed
        }
        return this.inputFilter;
    }

    /**
     * Set the InputFilter for validation
     * @param {InputFilter} inputFilter - The InputFilter instance to use
     * @returns {PostEntity}
     */
    setInputFilter(inputFilter) {
        this.inputFilter = inputFilter;
        return this;
    }

    /**
     * Validate the post entity
     * Uses the InputFilter to validate entity data
     * @returns {boolean} - True if valid, false otherwise
     */
    isValid() {
        const inputFilter = this.getInputFilter();
        inputFilter.setData(this.getObjectCopy());
        return inputFilter.isValid();
    }

    // ==================== Utility Methods ====================

    /**
     * Get data prepared for database insertion
     * Removes null id and returns underscore_case keys
     *
     * @param {boolean} forUpdate - If true, includes id for UPDATE queries
     * @returns {Object} - Data object ready for database
     */
    getDataForDatabase(forUpdate = false) {
        const data = this.getObjectCopy();

        // Remove id for INSERT operations
        if (!forUpdate) {
            delete data.id;
        }

        // Convert undefined values to null for PostgreSQL compatibility
        Object.keys(data).forEach(key => {
            if (data[key] === undefined) {
                data[key] = null;
            }
        });

        // Remove computed/read-only fields that shouldn't be manually set
        // (created_at and updated_at are handled by database triggers)

        return data;
    }

    /**
     * Prepare data for form display
     * Returns only fields that should be shown in forms
     *
     * @returns {Object}
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
     * @returns {boolean}
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
     * @returns {string[]} - Array of error messages
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
