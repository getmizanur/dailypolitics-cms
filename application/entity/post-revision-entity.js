const AbstractEntity = require(
    global.applicationPath('/library/core/common/abstract-entity'));
const VarUtil = require(
    global.applicationPath('/library/util/var-util'));
const InputFilter = require(
    global.applicationPath('/library/input-filter/input-filter'));

/**
 * PostRevisionEntity - Represents a post revision entity with content
 * snapshot and metadata
 * Maps to the 'post_revisions' table in PostgreSQL database
 * Provides revision lifecycle management including draft, approved, and
 * superseded states
 * Stores complete snapshots of post content and metadata at specific
 * points in time
 * Supports editorial workflow with approval tracking and change reason
 * documentation
 * Enforces one draft revision per post through database unique
 * constraint
 * Extends AbstractEntity for common entity functionality (get/set
 * methods)
 * @extends AbstractEntity
 */
class PostRevisionEntity extends AbstractEntity {

    /**
     * Constructor
     * Initializes post revision entity with comprehensive database
     * schema
     * All fields map directly to PostgreSQL 'post_revisions' table
     * columns
     * Sets up default values matching database constraints
     * @param {Object} data - Optional initial data to populate entity
     */
    constructor(data = null) {
        super();

        // Initialize storage with default post revision structure
        // matching database schema
        this.storage = {
            // Primary key
            id: null,

            // Foreign key to parent post
            post_id: null,               // References posts(id)

            // Content snapshot - captures post state at revision time
            title: null,                 // Post title snapshot
            excerpt_markdown: null,      // Short summary (Markdown)
            excerpt_html: null,          // Short summary (HTML)
            content_markdown: null,      // Full content (Markdown)
            content_html: null,          // Full content (HTML)

            // Metadata snapshot - captures post metadata at revision
            // time
            meta_title: null,            // SEO title override
            meta_description: null,      // SEO meta description
            category_id: null,           // Foreign key to categories
            presentation_style_id: null, // Foreign key to
                                         // presentation_styles

            // Revision metadata
            change_reason: null,         // Why this revision was
                                         // created

            // Revision lifecycle
            status: 'draft',             // draft/approved/superseded

            // User tracking
            created_by: null,            // User ID who created revision
            approved_by: null,           // User ID who approved
                                         // revision

            // Timestamps
            approved_at: null,           // When revision was approved
            created_at: null,            // When record was created
            updated_at: null             // When record was last updated
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
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    exchangeObject(data) {
        if (!VarUtil.isObject(data)) {
            return this;
        }

        // Map all properties from data to storage using conditional
        // assignment to preserve defaults when values are undefined

        // Primary key
        if (data.id !== undefined) this.storage.id = data.id;

        // Foreign key
        if (data.post_id !== undefined)
            this.storage.post_id = data.post_id;

        // Content snapshot
        if (data.title !== undefined) this.storage.title = data.title;
        if (data.excerpt_markdown !== undefined)
            this.storage.excerpt_markdown = data.excerpt_markdown;
        if (data.excerpt_html !== undefined)
            this.storage.excerpt_html = data.excerpt_html;
        if (data.content_markdown !== undefined)
            this.storage.content_markdown = data.content_markdown;
        if (data.content_html !== undefined)
            this.storage.content_html = data.content_html;

        // Metadata snapshot
        if (data.meta_title !== undefined)
            this.storage.meta_title = data.meta_title;
        if (data.meta_description !== undefined)
            this.storage.meta_description = data.meta_description;
        if (data.category_id !== undefined)
            this.storage.category_id = data.category_id;
        if (data.presentation_style_id !== undefined)
            this.storage.presentation_style_id =
                data.presentation_style_id;

        // Revision metadata
        if (data.change_reason !== undefined)
            this.storage.change_reason = data.change_reason;

        // Revision lifecycle
        if (data.status !== undefined)
            this.storage.status = data.status;

        // User tracking
        if (data.created_by !== undefined)
            this.storage.created_by = data.created_by;
        if (data.approved_by !== undefined)
            this.storage.approved_by = data.approved_by;

        // Timestamps
        if (data.approved_at !== undefined)
            this.storage.approved_at = data.approved_at;
        if (data.created_at !== undefined)
            this.storage.created_at = data.created_at;
        if (data.updated_at !== undefined)
            this.storage.updated_at = data.updated_at;

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
            post_id: this.storage.post_id,
            title: this.storage.title,
            excerpt_markdown: this.storage.excerpt_markdown,
            excerpt_html: this.storage.excerpt_html,
            content_markdown: this.storage.content_markdown,
            content_html: this.storage.content_html,
            meta_title: this.storage.meta_title,
            meta_description: this.storage.meta_description,
            category_id: this.storage.category_id,
            presentation_style_id: this.storage.presentation_style_id,
            change_reason: this.storage.change_reason,
            status: this.storage.status,
            created_by: this.storage.created_by,
            approved_by: this.storage.approved_by,
            approved_at: this.storage.approved_at,
            created_at: this.storage.created_at,
            updated_at: this.storage.updated_at
        };
    }

    // ================================================================
    // CONVENIENCE GETTERS - Read access to entity fields
    // All getters use AbstractEntity's get() method for consistency
    // ================================================================

    /**
     * Get revision ID
     * @returns {number|null} Primary key ID
     */
    getId() {
        return this.get('id');
    }

    /**
     * Get post ID
     * @returns {number|null} Foreign key to posts table
     */
    getPostId() {
        return this.get('post_id');
    }

    /**
     * Get revision title
     * @returns {string|null} Post title snapshot
     */
    getTitle() {
        return this.get('title');
    }

    /**
     * Get excerpt markdown
     * @returns {string|null} Post excerpt in Markdown format
     */
    getExcerptMarkdown() {
        return this.get('excerpt_markdown');
    }

    /**
     * Get excerpt HTML
     * @returns {string|null} Post excerpt in HTML format
     */
    getExcerptHtml() {
        return this.get('excerpt_html');
    }

    /**
     * Get content markdown
     * @returns {string|null} Full post content in Markdown format
     */
    getContentMarkdown() {
        return this.get('content_markdown');
    }

    /**
     * Get content HTML
     * @returns {string|null} Full post content in HTML format
     */
    getContentHtml() {
        return this.get('content_html');
    }

    /**
     * Get meta title
     * @returns {string|null} SEO meta title override
     */
    getMetaTitle() {
        return this.get('meta_title');
    }

    /**
     * Get meta description
     * @returns {string|null} SEO meta description
     */
    getMetaDescription() {
        return this.get('meta_description');
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
     * Get change reason
     * @returns {string|null} Explanation for why revision was created
     */
    getChangeReason() {
        return this.get('change_reason');
    }

    /**
     * Get revision status
     * Returns 'draft' as default if status not explicitly set
     * @returns {string} Current status (draft/approved/superseded)
     */
    getStatus() {
        return this.get('status', 'draft');
    }

    /**
     * Get creator ID
     * @returns {number|null} User ID who created revision
     */
    getCreatedBy() {
        return this.get('created_by');
    }

    /**
     * Get approver ID
     * @returns {number|null} User ID who approved revision
     */
    getApprovedBy() {
        return this.get('approved_by');
    }

    /**
     * Get approved timestamp
     * @returns {Date|string|null} When revision was approved
     */
    getApprovedAt() {
        return this.get('approved_at');
    }

    /**
     * Get created timestamp
     * @returns {Date|string|null} When record was created
     */
    getCreatedAt() {
        return this.get('created_at');
    }

    /**
     * Get updated timestamp
     * @returns {Date|string|null} When record was last updated
     */
    getUpdatedAt() {
        return this.get('updated_at');
    }

    // ================================================================
    // STATUS CHECK METHODS - Convenience methods for status checks
    // ================================================================

    /**
     * Check if revision is draft
     * @returns {boolean} True if status is 'draft', false otherwise
     */
    isDraft() {
        return this.get('status') === 'draft';
    }

    /**
     * Check if revision is approved
     * @returns {boolean} True if status is 'approved', false otherwise
     */
    isApproved() {
        return this.get('status') === 'approved';
    }

    /**
     * Check if revision is superseded
     * @returns {boolean} True if status is 'superseded', false
     *                    otherwise
     */
    isSuperseded() {
        return this.get('status') === 'superseded';
    }

    // ================================================================
    // CONVENIENCE SETTERS - Write access to entity fields
    // All setters use AbstractEntity's set() method for consistency
    // Return this entity for method chaining
    // ================================================================

    /**
     * Set revision ID
     * @param {number} id - Primary key ID
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setId(id) {
        return this.set('id', id);
    }

    /**
     * Set post ID
     * @param {number} postId - Foreign key to posts table
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setPostId(postId) {
        return this.set('post_id', postId);
    }

    /**
     * Set revision title
     * @param {string} title - Post title snapshot
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setTitle(title) {
        return this.set('title', title);
    }

    /**
     * Set excerpt markdown
     * @param {string} excerptMarkdown - Post excerpt in Markdown format
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setExcerptMarkdown(excerptMarkdown) {
        return this.set('excerpt_markdown', excerptMarkdown);
    }

    /**
     * Set excerpt HTML
     * @param {string} excerptHtml - Post excerpt in HTML format
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setExcerptHtml(excerptHtml) {
        return this.set('excerpt_html', excerptHtml);
    }

    /**
     * Set content markdown
     * @param {string} contentMarkdown - Full post content in Markdown
     *                                   format
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setContentMarkdown(contentMarkdown) {
        return this.set('content_markdown', contentMarkdown);
    }

    /**
     * Set content HTML
     * @param {string} contentHtml - Full post content in HTML format
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setContentHtml(contentHtml) {
        return this.set('content_html', contentHtml);
    }

    /**
     * Set meta title
     * @param {string} metaTitle - SEO meta title override
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setMetaTitle(metaTitle) {
        return this.set('meta_title', metaTitle);
    }

    /**
     * Set meta description
     * @param {string} metaDescription - SEO meta description
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setMetaDescription(metaDescription) {
        return this.set('meta_description', metaDescription);
    }

    /**
     * Set category ID
     * @param {number} categoryId - Foreign key to categories table
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setCategoryId(categoryId) {
        return this.set('category_id', categoryId);
    }

    /**
     * Set presentation style ID
     * @param {number} presentationStyleId - Foreign key to
     *                                       presentation_styles table
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setPresentationStyleId(presentationStyleId) {
        return this.set('presentation_style_id', presentationStyleId);
    }

    /**
     * Set change reason
     * @param {string} changeReason - Explanation for why revision was
     *                                created
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setChangeReason(changeReason) {
        return this.set('change_reason', changeReason);
    }

    /**
     * Set revision status
     * Validates that status is one of the allowed values
     * @param {string} status - Status value (draft/approved/superseded)
     * @returns {PostRevisionEntity} This entity for method chaining
     * @throws {Error} If status is not valid
     */
    setStatus(status) {
        const validStatuses = ['draft', 'approved', 'superseded'];
        if (!validStatuses.includes(status)) {
            throw new Error(
                `Invalid status: ${status}. Must be one of: ` +
                `${validStatuses.join(', ')}`);
        }
        return this.set('status', status);
    }

    /**
     * Set creator ID
     * @param {number} createdBy - User ID who created revision
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setCreatedBy(createdBy) {
        return this.set('created_by', createdBy);
    }

    /**
     * Set approver ID
     * @param {number} approvedBy - User ID who approved revision
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setApprovedBy(approvedBy) {
        return this.set('approved_by', approvedBy);
    }

    /**
     * Set approved timestamp
     * @param {Date|string} approvedAt - When revision was approved
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setApprovedAt(approvedAt) {
        return this.set('approved_at', approvedAt);
    }

    /**
     * Set created timestamp
     * @param {Date|string} createdAt - When record was created
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setCreatedAt(createdAt) {
        return this.set('created_at', createdAt);
    }

    /**
     * Set updated timestamp
     * @param {Date|string} updatedAt - When record was last updated
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setUpdatedAt(updatedAt) {
        return this.set('updated_at', updatedAt);
    }

    // ================================================================
    // BUSINESS LOGIC METHODS - Status transitions and operations
    // ================================================================

    /**
     * Approve the revision
     * Changes status to 'approved' and sets approved_by and
     * approved_at
     * Can only approve from draft status
     * Used in editorial workflow to mark revision as reviewed and
     * approved
     * @param {number} approvedBy - User ID who approved the revision
     * @returns {PostRevisionEntity} This entity for method chaining
     * @throws {Error} If revision is not in draft status
     */
    approve(approvedBy) {
        if (this.get('status') !== 'draft') {
            throw new Error(
                'Can only approve revisions with draft status');
        }

        this.set('status', 'approved');
        this.set('approved_by', approvedBy);
        this.set('approved_at', new Date().toISOString());
        return this;
    }

    /**
     * Mark revision as superseded
     * Changes status to 'superseded' to indicate this revision has
     * been replaced
     * Typically called when a newer revision is approved or published
     * Can only supersede from approved status
     * @returns {PostRevisionEntity} This entity for method chaining
     * @throws {Error} If revision is not approved
     */
    supersede() {
        if (this.get('status') !== 'approved') {
            throw new Error(
                'Can only supersede revisions with approved status');
        }

        this.set('status', 'superseded');
        return this;
    }

    /**
     * Set revision as draft
     * Changes status to 'draft' (unpublished/unapproved state)
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setDraft() {
        return this.set('status', 'draft');
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
                'post_id': {
                    required: true,
                    requiredMessage: "Post ID is required",
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
                                INVALID: 'Please provide valid post ID'
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
                                max: 255,
                                messageTemplate: {
                                    INVALID_TOO_SHORT:
                                        'Title must be at least 20 ' +
                                        'characters long',
                                    INVALID_TOO_LONG:
                                        'Title must not exceed 255 ' +
                                        'characters'
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
                'content_html': {
                    required: true,
                    requiredMessage:
                        "Content HTML is required. Please enter content"
                },
                'change_reason': {
                    required: false,
                    requiredMessage: "Change reason",
                    filters: [
                        { name: 'HtmlEntities' },
                        { name: 'StringTrim' },
                        { name: 'StripTags' }
                    ]
                },
                'created_by': {
                    required: true,
                    requiredMessage: "Creator user is required.",
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
                                INVALID: 'Please provide valid user ID'
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
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    setInputFilter(inputFilter) {
        this.inputFilter = inputFilter;
        return this;
    }

    /**
     * Validate the revision entity
     * Uses the InputFilter to validate entity data against defined
     * rules
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
     * Converts undefined values to null for PostgreSQL compatibility
     * @param {boolean} forUpdate - If true, includes id for UPDATE
     *                              queries; if false, excludes id for
     *                              INSERT
     * @returns {Object} Data object ready for database operation
     */
    getDataForDatabase(forUpdate = false) {
        const data = this.getObjectCopy();

        // Remove id for INSERT operations (database auto-generates)
        if (!forUpdate) {
            delete data.id;
        }

        // Convert undefined values to null for PostgreSQL compatibility
        Object.keys(data).forEach(key => {
            if (data[key] === undefined) {
                data[key] = null;
            }
        });

        // Remove timestamp fields - they are handled by database triggers
        // For INSERT: created_at and updated_at set by trigger
        // For UPDATE: only updated_at set by trigger, created_at should
        // not be modified
        delete data.created_at;
        delete data.updated_at;

        return data;
    }

    /**
     * Prepare data for form display
     * Returns only fields that should be shown in forms
     * Excludes internal/system fields like timestamps and auto-managed
     * fields
     * @returns {Object} Data object suitable for form population
     */
    getDataForForm() {
        return {
            id: this.get('id'),
            post_id: this.get('post_id'),
            title: this.get('title'),
            excerpt_markdown: this.get('excerpt_markdown'),
            content_markdown: this.get('content_markdown'),
            meta_title: this.get('meta_title'),
            meta_description: this.get('meta_description'),
            category_id: this.get('category_id'),
            presentation_style_id: this.get('presentation_style_id'),
            change_reason: this.get('change_reason'),
            status: this.get('status')
        };
    }

    /**
     * Create revision snapshot from post entity
     * Copies relevant fields from a PostEntity to this revision
     * Used when creating a new revision from an existing post
     * Does not copy post_id, id, status, or user tracking fields
     * @param {Object} postEntity - PostEntity instance or post data
     *                              object
     * @returns {PostRevisionEntity} This entity for method chaining
     */
    createFromPost(postEntity) {
        // Handle both PostEntity instances and plain objects
        const postData = typeof postEntity.getObjectCopy === 'function'
            ? postEntity.getObjectCopy()
            : postEntity;

        // Copy content fields
        if (postData.title !== undefined)
            this.setTitle(postData.title);
        if (postData.excerpt_markdown !== undefined)
            this.setExcerptMarkdown(postData.excerpt_markdown);
        if (postData.excerpt_html !== undefined)
            this.setExcerptHtml(postData.excerpt_html);
        if (postData.content_markdown !== undefined)
            this.setContentMarkdown(postData.content_markdown);
        if (postData.content_html !== undefined)
            this.setContentHtml(postData.content_html);

        // Copy metadata fields
        if (postData.meta_title !== undefined)
            this.setMetaTitle(postData.meta_title);
        if (postData.meta_description !== undefined)
            this.setMetaDescription(postData.meta_description);
        if (postData.category_id !== undefined)
            this.setCategoryId(postData.category_id);
        if (postData.presentation_style_id !== undefined)
            this.setPresentationStyleId(postData.presentation_style_id);

        return this;
    }

    /**
     * Check if revision has required fields
     * Validates that all essential fields are populated
     * @returns {boolean} True if all required fields present, false
     *                    otherwise
     */
    hasRequiredFields() {
        return !!(
            this.get('post_id') &&
            this.get('title') &&
            this.get('content_html') &&
            this.get('content_markdown')
        );
    }

    /**
     * Get validation errors for required fields
     * Returns array of human-readable error messages for missing
     * required fields
     * Used to provide feedback when validation fails
     * @returns {string[]} Array of error messages (empty if all
     *                     required fields present)
     */
    getRequiredFieldErrors() {
        const errors = [];

        if (!this.get('post_id')) {
            errors.push('Post ID is required');
        }
        if (!this.get('title')) {
            errors.push('Title is required');
        }
        if (!this.get('content_markdown')) {
            errors.push('Content (Markdown) is required');
        }
        if (!this.get('content_html')) {
            errors.push('Content (HTML) is required');
        }

        return errors;
    }
}

module.exports = PostRevisionEntity;
