const Controller = require(
    global.applicationPath('/library/mvc/controller/base-controller'));
const ArticleForm = require(
    global.applicationPath('/application/form/article-form'));
const SessionContainer = require(
    global.applicationPath('/library/session/session-container'));
const InputFilter = require(
    global.applicationPath('/library/input-filter/input-filter'));
const VarUtil = require(
    global.applicationPath('/library/util/var-util'));
const JsonUtil = require(
    global.applicationPath('/library/util/json-util'));
const fs = require('fs');
const PostEntity = require('../../../entity/post-entity');

/**
 * PostController
 *
 * Manages blog post CRUD operations for the admin area.
 * Handles creating new posts, editing existing posts (both drafts and
 * published), listing posts with pagination, and post status
 * management.
 *
 * Key Features:
 * - Create new posts as drafts or publish immediately
 * - Edit draft posts with full field editing
 * - View published posts in read-only mode
 * - Create/continue revision drafts for published posts
 * - Unpublish published posts (change status to draft)
 * - Delete draft posts permanently
 * - Paginated post listing with all statuses
 *
 * Uses PostService for database operations and PostEntity for
 * validation.
 * Extends the base Controller class for MVC pattern.
 *
 * @extends Controller
 */
class PostController extends Controller {

    /**
     * Constructor
     *
     * Initializes the PostController with optional configuration.
     *
     * @param {Object} options - Controller configuration options
     */
    constructor(options = {}) {
        super(options);
    }

    /**
     * Pre-dispatch hook
     *
     * Runs before every action in this controller.
     * Checks user authentication and redirects to login if not
     * authenticated.
     * Sets the page title helper to append 'Admin' to all page
     * titles.
     *
     * Security:
     * - Validates user has active authentication session
     * - Redirects unauthenticated users to login page
     * - Displays error message for unauthenticated access attempts
     *
     * @returns {Response|undefined} Redirect response if not
     *                                authenticated, undefined
     *                                otherwise
     */
    preDispatch() {
        console.log('[PostController.preDispatch] Called');

        // Check authentication - all post management requires login
        const authService = this.getServiceManager()
            .get('AuthenticationService');

        if (!authService.hasIdentity()) {
            super.plugin('flashMessenger').addErrorMessage(
                'You must be logged in to access this page');
            return this.plugin('redirect').toRoute('adminLoginIndex');
        }

        console.log(
            '[PostController.preDispatch] About to append Admin to ' +
            'headTitle');

        // Add 'Admin' to page title for all admin pages
        this.getServiceManager().get('ViewHelperManager')
            .get('headTitle').append('Admin');

        console.log('[PostController.preDispatch] Finished');
    }

    /**
     * Index action
     *
     * Default action for post management.
     * Delegates to listAction() to display the paginated post list.
     *
     * @returns {Promise<Response|ViewModel>} Result from listAction
     */
    async indexAction() {
        return this.listAction();
    }

    /**
     * List action
     *
     * Displays paginated list of all posts (drafts, published,
     * archived).
     * Shows 5 posts per page with numbered pagination controls.
     *
     * Features:
     * - Fetches posts from database with PostService
     * - Calculates total pages for pagination
     * - Generates numbered page links
     * - Fetches recent posts for sidebar
     * - Supports page parameter from route for pagination
     *
     * Query Parameters:
     * - page: Current page number (defaults to 1)
     *
     * View Variables:
     * - posts: Array of post objects for current page
     * - pagination: Object with currentPage, totalItems, baseUrl
     *
     * @returns {Promise<ViewModel>} View with posts and pagination
     *                                data
     */
    async listAction() {
        const postService = this.getServiceManager()
            .get('PostService');

        // Get current page from route parameter (default to 1)
        const page = parseInt(
            this.plugin('params').fromRoute('page')) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        // Fetch posts with all statuses and total count for
        // pagination
        const [posts, totalCount] = await Promise.all([
            postService.getAllPostsWithStatus(
                ['draft', 'published', 'archived'], limit, offset),
            postService.getPostCount({ includeDrafts: true })
        ]);

        // Get recent posts for sidebar
        const recentPosts = await postService
            .getRecentPostsForSidebar();

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);

        // Build numbered pagination array for view
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push({
                number: i,
                isCurrent: i === page
            });
        }

        const baseUrl = this.helper('url')
            .fromRoute('adminDashboardIndex');

        // Set view variables for template rendering
        this.getView()
            .setVariable('posts', posts)
            .setVariable('pagination', {
                mode: 'admin',
                currentPage: page,
                totalItems: totalCount,
                baseUrl: baseUrl
            });

        return this.getView();
    }

    /**
     * New action
     *
     * Creates a new blog post. Displays article form on GET request,
     * processes form submission on POST request.
     *
     * Features:
     * - Displays article creation form with all fields
     * - Validates all required and optional fields
     * - Converts markdown to HTML for storage
     * - Generates unique slug automatically
     * - Supports "Save Draft" and "Publish" actions
     * - Pre-populates author fields with current user
     * - Redirects to confirmation page on success
     *
     * Validation Rules:
     * - Title: Required, 20-150 characters
     * - Excerpt: Optional, max 150 characters
     * - Content: Required
     * - Category: Required, must be valid category ID
     * - Meta Description: Optional, max 150 characters
     * - Comments Enabled: Optional boolean
     *
     * Form Actions:
     * - Save draft: Creates post with status 'draft'
     * - Publish: Creates post with status 'published', sets
     *            published_at and published_by
     *
     * @returns {Promise<Response|ViewModel>} Redirect on success or
     *                                         view with form
     */
    async newAction() {
        // Fetch all categories from database for category dropdown
        const postService = this.getServiceManager()
            .get('PostService');
        const categories = await postService.getAllCategories();

        // Create form instance
        const form = new ArticleForm();

        // Get current user identity for author tracking
        const authService = this.getServiceManager()
            .get('AuthenticationService');
        const identity = authService.getIdentity();
        const userRole = identity?.role || 'author';
        const currentUserId = identity?.id || null;
        const authorName = identity?.name || null;

        // Set form attributes
        const actionUrl = this.helper('url')
            .fromRoute('adminDashboardNew');
        form.setAction(actionUrl);
        form.setMethod('POST');

        // Initialize form fields
        form.addIdField();
        form.addTitleField();
        form.addExcerptField();
        form.addContentField();
        form.addAuthorIdField();
        form.addAuthorNameField();
        form.addCategoryField('category_id', categories);
        form.addMetaDescriptionField();
        form.addCommentEnabledField();
        form.addExitThisPageButton();
        form.addPublishButton();
        form.addSaveButton();

        // Pre-populate author fields with current user information
        form.setData({
            author_id: currentUserId,
            author_name: authorName
        });

        // Build category IDs array for validation
        const categoryIds = categories.map(cat => String(cat.id));

        // Configure input filter with validation rules
        const inputFilter = InputFilter.factory({
            'author_id': {
                required: true,
                filters: [
                    { name: 'HtmlEntities' },
                    { name: 'StringTrim' },
                    { name: 'StripTags' }
                ]
            },
            'title': {
                required: true,
                requiredMessage:
                    "<strong>Title</strong> is required. " +
                    "Please enter a title.",
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
                required: true,
                requiredMessage: "<strong>Excerpt</strong> is required. Please enter an excerpt.",
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
                    "<strong>Content</strong> is required. " +
                    "Please enter content",
                filters: [
                    { name: 'HtmlEntities' },
                    { name: 'StringTrim' },
                    { name: 'StripTags' }
                ]
            },
            'category_id': {
                required: true,
                requiredMessage:
                    "<strong>Category</strong> is required. " +
                    "Please select a category",
                filters: [
                    { name: 'HtmlEntities' },
                    { name: 'StringTrim' },
                    { name: 'StripTags' }
                ],
                validators: [
                    {
                        name: 'InArray',
                        options: {
                            haystack: categoryIds
                        },
                        messages: {
                            NOT_IN_ARRAY:
                                'Please select a valid category'
                        }
                    }
                ]
            },
            'meta_description': {
                required: false,
                filters: [
                    { name: 'HtmlEntities' },
                    { name: 'StringTrim' },
                    { name: 'StripTags' }
                ],
                validators: [
                    {
                        name: 'StringLength',
                        options: {
                            name: "meta_description",
                            max: 150,
                            messageTemplate: {
                                INVALID_TOO_LONG:
                                    '<strong>Meta description' +
                                    '</strong> must not exceed 150 ' +
                                    'characters'
                            }
                        }
                    }
                ]
            },
            'comments_enabled': {
                required: false,
                filters: [
                    { name: 'HtmlEntities' },
                    { name: 'StringTrim' },
                    { name: 'StripTags' }
                ],
                validators: [
                    {
                        name: 'Callback',
                        options: {
                            callback: (value) => {
                                // Accept '1', 1, true, 'true', 'on'
                                // for checked
                                // Accept '0', 0, false, 'false', '',
                                // null, undefined for unchecked
                                if (value === '1' || value === 1 ||
                                    value === true ||
                                    value === 'true' ||
                                    value === 'on') {
                                    return true;
                                }
                                if (value === '0' || value === 0 ||
                                    value === false ||
                                    value === 'false' ||
                                    value === '' ||
                                    value === null ||
                                    value === undefined) {
                                    return true;
                                }
                                return false;
                            },
                            messageTemplate: {
                                INVALID: 'Invalid value for comment ' +
                                    'enabled'
                            }
                        }
                    }
                ]
            }
        });
        form.setInputFilter(inputFilter);

        // Handle POST request - form submission
        if (super.getRequest().isPost()) {
            const postData = super.getRequest().getPost();

            console.log("postData: " + JSON.stringify(postData));

            // Handle exit this page action first (doesn't need
            // validation)
            const isExitThisPage = VarUtil.isset(
                postData.exit_this_page) &&
                postData.exit_this_page === 'Exit this page';

            if (isExitThisPage) {
                // Simply redirect to dashboard without any changes
                return this.plugin('redirect')
                    .toRoute('adminDashboardIndex');
            }

            form.setData(postData);

            const isFormValid = form.isValid();
            if (isFormValid) {
                // Convert markdown to HTML for storage
                const contentHtml = this.plugin('markdownToHtml')
                    .convert(postData.content_markdown);
                const excerptHtml = this.plugin('markdownToHtml')
                    .convert(postData.excerpt_markdown);

                // Generate unique slug for the post using opaqueId plugin
                // Try up to 5 times to find a unique slug
                let slug;
                let attempts = 0;
                while (attempts < 5) {
                    slug = this.plugin('opaqueId').generate();
                    const exists = await postService.slugExists(slug);
                    if (!exists) {
                        break;
                    }
                    attempts += 1;
                }

                if (attempts >= 5) {
                    throw new Error(
                        'Failed to generate unique slug after 5 ' +
                        'attempts');
                }

                // Create post entity with form data
                const postEntity = new PostEntity(postData);
                const currentTimestamp = new Date().toISOString();

                // Set all post fields
                postEntity
                    .setSlug(slug)
                    .setTitle(postData.title)
                    .setExcerptMarkdown(postData.excerpt_markdown)
                    .setExcerptHtml(excerptHtml)
                    .setContentMarkdown(postData.content_markdown)
                    .setContentHtml(contentHtml)
                    .setAuthorId(postData.author_id)
                    .setCategoryId(postData.category_id)
                    .setCommentsEnabled(
                        postData.comments_enabled === '1' ||
                        postData.comments_enabled === true ||
                        postData.comments_enabled === 'on')
                    .setRegenerateStatic(
                        postData.regenerate_static || false)
                    .setReviewRequested(
                        postData.review_requested || false)
                    .setCreatedAt(currentTimestamp)
                    .setUpdatedAt(currentTimestamp);

                // Note: published_at, deleted_at, approved_at, etc.
                // are NOT set here for new posts
                // They remain null and will be set when the post is
                // published/deleted/approved

                // Handle Save Draft action
                if (VarUtil.isset(postData.save) &&
                    postData.save === 'Save draft') {
                    postEntity.setDraft();
                    postEntity.setUpdatedBy(currentUserId);
                }
                // Handle Publish action
                else if (VarUtil.isset(postData.publish) &&
                         postData.publish === 'Publish') {
                    postEntity.publish(currentUserId);
                    postEntity.approve(currentUserId);
                    postEntity.setUpdatedBy(currentUserId);
                }

                // Get data formatted for database insertion
                const dataForDb = postEntity.getDataForDatabase();
                const isValid = postEntity.isValid();

                // Log validation errors if any
                if (!isValid) {
                    const invalidInputs = postEntity.getInputFilter()
                        .getInvalidInputs();
                    console.log("\n=== VALIDATION ERRORS ===");
                    Object.keys(invalidInputs).forEach((fieldName) => {
                        const messages = invalidInputs[fieldName]
                            .getMessages();
                        const value = postEntity.get(fieldName);
                        console.log(`Field: ${fieldName}`);
                        console.log(`  Value: "${value}"`);
                        console.log(`  Errors: ${messages.join(', ')}`);
                    });
                    console.log("========================\n");
                }

                // Create post in database if validation passed
                if (isValid) {
                    console.log("dataForDb: " +
                        JSON.stringify(dataForDb));
                    const createPost = await postService
                        .createPost(dataForDb);

                    // Add success message
                    super.plugin('flashMessenger').addSuccessMessage(
                        `Post saved successfully. Return back to ` +
                        `Dashboard`);

                    // Redirect to confirmation page
                    return this.plugin('redirect')
                        .toRoute('adminDashboardConfirmation');
                }
            } else {
                // Form validation failed - get and display errors

                // Get validation messages from form
                const formMessages = form.getMessages();

                // Attach error messages to individual form fields
                Object.keys(formMessages).forEach((fieldName) => {
                    if (form.has(fieldName)) {
                        console.log("errorMessages: " +
                            formMessages[fieldName]);
                        console.log("errorFieldName: " + fieldName);
                        form.get(fieldName)
                            .setMessages(formMessages[fieldName]);
                    }
                });

                // Extract error messages for flash messenger
                let errorMessages = [];
                Object.keys(formMessages).forEach((fieldName) => {
                    const fieldMessages = formMessages[fieldName];
                    if (Array.isArray(fieldMessages)) {
                        errorMessages =
                            errorMessages.concat(fieldMessages);
                    } else {
                        errorMessages.push(fieldMessages);
                    }
                });

                // Add validation error messages to flash messenger
                if (errorMessages.length > 0) {
                    errorMessages.forEach((message) => {
                        super.plugin('flashMessenger')
                            .addErrorMessage(message);
                    });
                }
            }
        }

        // Return view with form (GET request or validation failed)
        return this.getView()
            .setVariable('f', form);
    }

    /**
     * Edit action
     *
     * Displays and handles editing of posts. Behavior changes based
     * on post status:
     *
     * Draft Posts:
     * - All fields are editable
     * - Shows Save, Publish, Delete, Exit buttons
     * - Can be saved as draft or published
     * - Can be permanently deleted
     *
     * Published Posts:
     * - All fields are read-only
     * - Shows Create/Continue Revision Draft, Unpublish, Exit buttons
     * - Cannot be edited directly (must create revision)
     * - Can be unpublished (changes status to draft)
     *
     * Features:
     * - Validates post ID as integer before database queries
     * - Checks for existing draft revision for published posts
     * - Conditionally shows buttons based on post status and revision
     *   state
     * - Handles form submission for save, publish, delete, unpublish
     * - Redirects to revision creation when requested
     *
     * Route Parameters:
     * - id: Post ID to edit
     *
     * Form Actions (Draft):
     * - Save: Updates post with status 'draft'
     * - Publish: Updates post with status 'published', sets
     *            published_at/published_by
     * - Delete: Permanently removes post from database
     * - Exit: Returns to dashboard without changes
     *
     * Form Actions (Published):
     * - Create Revision Draft: Redirects to revision creation
     * - Continue Revision Draft: Redirects to existing revision edit
     * - Unpublish: Changes status from 'published' to 'draft'
     * - Exit: Returns to dashboard without changes
     *
     * @returns {Promise<Response|ViewModel>} Redirect on form
     *                                         submission or view with
     *                                         form
     */
    async editAction() {
        const postService = this.getServiceManager()
            .get('PostService');

        // Fetch all categories from database for category dropdown
        const categories = await postService.getAllCategories();

        // Create form instance
        const form = new ArticleForm();
        let isDraft = false;

        // Get post ID from route parameter
        const postId = this.plugin('params').fromRoute('id');

        // Set form attributes
        const actionUrl = this.helper('url')
            .fromRoute('adminDashboardEdit', { id : postId });
        form.setAction(actionUrl);
        form.setMethod('POST');

        // Get current user identity for tracking
        const authService = this.getServiceManager()
            .get('AuthenticationService');
        const identity = authService.getIdentity();
        const userRole = identity?.role || 'author';
        const currentUserId = identity?.id || null;

        // Validate post ID before using it in database queries
        const inputFilter = InputFilter.factory({
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
            }
        });

        inputFilter.setData({ post_id: postId });

        // Only proceed if postId is valid
        if(!inputFilter.isValid()) {
            // Invalid post ID - redirect to dashboard
            this.plugin('flashMessenger')
                .addMessage('Invalid post ID provided', 'error');
            return this.plugin('redirect')
                .toRoute('adminDashboardIndex');
        }

        // Convert postId to integer after validation
        const postIdInt = parseInt(postId, 10);

        // Fetch post data from database (postId already validated)
        const post = await postService.getSinglePost(
            postIdInt, false, true);

        // Check if post is draft (assign to outer scope variable)
        isDraft = post && post.status === 'draft';

        // Initialize form fields (conditionally readonly based on
        // status)
        form.addIdField();
        form.addAuthorIdField();

        if (isDraft) {
            // Draft posts: all fields are editable
            form.addTitleField('title');
            form.addSlugField('slug');
            form.addExcerptField('excerpt_markdown');
            form.addContentField('content_markdown');
            form.addAuthorNameField('author_name');
            form.addCategoryField('category_id', categories);
            form.addMetaDescriptionField('meta_description');
            form.addCommentEnabledField('comments_enabled');
        } else {
            // Published posts: all fields are readonly
            form.addTitleField('title', { readonly: "readonly" });
            form.addSlugField('slug', { readonly: "readonly" });
            form.addExcerptField('excerpt_markdown',
                { readonly: "readonly" });
            form.addContentField('content_markdown',
                { readonly: "readonly" });
            form.addAuthorNameField('author_name',
                { readonly: "readonly" });
            form.addCategoryField('category_id', categories,
                { readonly: "readonly", disabled : "true" });
            form.addMetaDescriptionField('meta_description',
                { readonly: "readonly" });
            form.addCommentEnabledField('comments_enabled',
                { readonly: "readonly" });
        }

        // Build category IDs array for validation
        const categoryIds = categories.map(cat => String(cat.id));

        // Configure input filter with validation rules
        const formInputFilter = InputFilter.factory({
            'author_id': {
                required: true,
                filters: [
                    { name: 'HtmlEntities' },
                    { name: 'StringTrim' },
                    { name: 'StripTags' }
                ]
            },
            'title': {
                required: true,
                requiredMessage: "<strong>Title</strong> is " +
                    "required. Please enter a title.",
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
                required: true,
                requiredMessage: "<strong>Excerpt</strong> is required. Please enter an excerpt.",
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
                                    '<strong>Excerpt</strong> ' +
                                    'must not exceed 150 characters'
                            }
                        }
                    }
                ]
            },
            'content_markdown': {
                required: true,
                requiredMessage:
                    "<strong>Content</strong> is required. " +
                    "Please enter content",
                filters: [
                    { name: 'HtmlEntities' },
                    { name: 'StringTrim' },
                    { name: 'StripTags' }
                ]
            },
            'category_id': {
                required: true,
                requiredMessage:
                    "<strong>Category</strong> is required. " +
                    "Please select a category",
                filters: [
                    { name: 'HtmlEntities' },
                    { name: 'StringTrim' },
                    { name: 'StripTags' }
                ],
                validators: [
                    {
                        name: 'InArray',
                        options: {
                            haystack: categoryIds
                        },
                        messages: {
                            NOT_IN_ARRAY:
                                'Please select a valid category'
                        }
                    }
                ]
            },
            'meta_description': {
                required: false,
                filters: [
                    { name: 'HtmlEntities' },
                    { name: 'StringTrim' },
                    { name: 'StripTags' }
                ],
                validators: [
                    {
                        name: 'StringLength',
                        options: {
                            name: "meta_description",
                            max: 150,
                            messageTemplate: {
                                INVALID_TOO_LONG:
                                    '<strong>Meta description' +
                                    '</strong> must not exceed ' +
                                    '150 characters'
                            }
                        }
                    }
                ]
            },
            'comments_enabled': {
                required: false,
                filters: [
                    { name: 'Boolean' },
                    { name: 'StringTrim' }
                ],
                validators: [
                    {
                        name: 'InArray',
                        options: {
                            haystack: ['0', '1']
                        },
                        messages: {
                            NOT_IN_ARRAY:
                                'Invalid value for comments enabled'
                        }
                    }
                ]
            }
        });

        // Set input filter on form
        form.setInputFilter(formInputFilter);

        // Add buttons based on post status
        if (isDraft) {
            // Draft posts: Show Save, Publish, Delete, Exit buttons
            form.addSaveButton();
            form.addPublishButton();
            form.addDeleteButton();
            form.addExitThisPageButton();
        } else {
            // Published posts: Show revision and unpublish buttons
            const postRevisionService = this.getServiceManager()
                .get('PostRevisionService');
            let draftRevision = null;

            try {
                // Check if draft revision already exists
                draftRevision = await postRevisionService
                    .getMostRecentDraftRevision(postIdInt);

                if (draftRevision) {
                    // Draft revision exists - show continue button
                    form.addContinueRevisionDraftButton();
                } else {
                    console.log(
                        '[EditAction] No draft revision found for ' +
                        'post:', postIdInt);
                    // No draft exists - show create button
                    form.addCreateRevisionDraftButton();
                }
            } catch (error) {
                console.error(
                    '[EditAction] Error checking for draft revision:',
                    error);
                // On error, still show the button (fail-safe)
                form.addCreateRevisionDraftButton();
            }

            // Always show unpublish and exit buttons for published
            // posts
            form.addUnpublishButton();
            form.addExitThisPageButton();
        }

        // Populate form with post data
        if (post) {
            // Convert boolean to checkbox format ('1' or '0')
            const commentsEnabledValue = post.comments_enabled ? '1' : '0';

            form.setData({
                id: post.id,
                slug: post.slug,
                title: post.title,
                excerpt_markdown: post.excerpt_markdown,
                content_markdown: post.content_markdown,
                author_id: post.author_id,
                author_name: post.author_name,
                category_id: post.category_id,
                meta_description: post.meta_description,
                comments_enabled: commentsEnabledValue
            });
        }

        // Handle POST request - form submission
        if (super.getRequest().isPost()) {
            const postData = super.getRequest().getPost();

            // Handle exit this page action first (doesn't need
            // validation)
            const isExitThisPage = VarUtil.isset(
                postData.exit_this_page) &&
                postData.exit_this_page === 'Exit this page';

            if (isExitThisPage) {
                // Simply redirect to dashboard without any changes
                return this.plugin('redirect')
                    .toRoute('adminDashboardIndex');
            }

            // Handle draft post actions (save, publish, delete)
            const isSave = VarUtil.isset(postData.save) &&
                postData.save === 'Save draft';
            const isPublish = VarUtil.isset(postData.publish) &&
                postData.publish === 'Publish';
            const isDelete = VarUtil.isset(postData.delete) &&
                postData.delete === 'Delete';

            if (isSave || isPublish || isDelete) {
                // Validate the form for save and publish actions
                if (isSave || isPublish) {
                    form.setData(postData);

                    if (!form.isValid()) {
                        // Validation failed - re-render form with
                        // errors
                        return this.getView()
                            .setVariable('f', form)
                            .setVariable('isDraft', isDraft);
                    }

                    // Convert comments_enabled to boolean
                    // Filter already converted array to '1' or '0'
                    const commentsValue = formInputFilter.getValue(
                        'comments_enabled');
                    const commentsEnabled =
                        commentsValue === '1' ||
                        commentsValue === 1 ||
                        commentsValue === true;

                    console.log('[PostController.editAction] commentsValue:', commentsValue, 'type:', typeof commentsValue);
                    console.log('[PostController.editAction] commentsEnabled:', commentsEnabled, 'type:', typeof commentsEnabled);

                    // Create post entity with validated data
                    const postEntity = new PostEntity();
                    postEntity
                        .setId(postIdInt)
                        .setTitle(formInputFilter.getValue('title'))
                        .setSlug(post.slug)  // Use existing slug from DB
                        .setExcerptMarkdown(
                            formInputFilter.getValue('excerpt_markdown'))
                        .setContentMarkdown(
                            formInputFilter.getValue('content_markdown'))
                        .setAuthorId(formInputFilter.getValue('author_id'))
                        .setCategoryId(
                            formInputFilter.getValue('category_id'))
                        .setMetaDescription(
                            formInputFilter.getValue('meta_description'))
                        .setCommentsEnabled(commentsEnabled)
                        .setUpdatedBy(currentUserId);

                    // Set status and timestamps based on action
                    if (isPublish) {
                        postEntity
                            .setStatus('published')
                            .setPublishedAt(
                                new Date().toISOString())
                            .setPublishedBy(currentUserId)
                            .setRegenerateStatic(true);
                    } else {
                        postEntity.setStatus('draft');
                    }

                    // Update post in database
                    const postDataForDb = postEntity
                        .getDataForDatabase(true);
                    await postService.updatePostById(
                        postIdInt, postDataForDb);

                    // Add success message based on action
                    if (isPublish) {
                        super.plugin('flashMessenger')
                            .addSuccessMessage({
                                title: 'Post published',
                                message: 'Your post has been ' +
                                    'published successfully and will ' +
                                    'appear on the live site after ' +
                                    'the next build.'
                            });
                    } else {
                        super.plugin('flashMessenger')
                            .addSuccessMessage({
                                title: 'Draft saved',
                                message: 'Your draft has been saved ' +
                                    'successfully.'
                            });
                    }

                    // Redirect back to edit page
                    return this.plugin('redirect')
                        .toRoute('adminDashboardEdit',
                            { id: postIdInt });
                }

                // Handle delete action
                if (isDelete) {
                    // Delete the draft post permanently
                    await postService.deletePost(postIdInt);

                    // Add info message
                    super.plugin('flashMessenger').addInfoMessage({
                        title: 'Draft deleted',
                        message: 'Draft post has been deleted ' +
                            'successfully.'
                    });

                    // Redirect to dashboard
                    return this.plugin('redirect')
                        .toRoute('adminDashboardIndex');
                }
            }

            // Handle revision draft actions (both create and continue)
            if ((VarUtil.isset(postData.create_revision_draft) &&
                 postData.create_revision_draft ===
                 'Create revision draft') ||
                (VarUtil.isset(postData.continue_revision_draft) &&
                 postData.continue_revision_draft ===
                 'Continue revision draft')) {
                // Redirect to revision creation/edit page
                return this.plugin('redirect')
                    .toRoute('adminRevisionNew',
                        { post_id: postIdInt });
            }
            // Handle unpublish action
            else if (VarUtil.isset(postData.unpublish) &&
                     postData.unpublish === 'Unpublish') {
                // Change status from published to draft
                await postService.updatePostById(postIdInt, {
                    status: 'draft',
                    regenerate_static: true,
                    updated_by: currentUserId
                });

                // Add warning message
                super.plugin('flashMessenger').addWarningMessage({
                    title: "Post unpublished",
                    message: "Post unpublished successfully. The " +
                        "live version will be removed in the next " +
                        "site build"
                });

                // Redirect back to the edit page
                return this.plugin('redirect')
                    .toRoute('adminDashboardEdit', { id: postIdInt });
            }

            // Unknown action - show error
            super.plugin('flashMessenger').addErrorMessage(
                `We're sorry — something went wrong. ` +
                `Please let us know and try again shortly`);
        }

        // Return view with form (GET request or unknown action)
        return this.getView()
            .setVariable('f', form)
            .setVariable('isDraft', isDraft);
    }

    /**
     * Preview action
     *
     * Displays a preview of how the post will look on the live site.
     * Allows admins/editors to see the rendered post before publishing.
     *
     * Route: /admin/posts/:slug/preview
     *
     * @returns {ViewModel} View with post data for preview
     */
    async viewAction() {
        try {
            const postService = this.getServiceManager().get('PostService');
            const revisionService = this.getServiceManager().get('PostRevisionService');
            const postId = this.getParam('post_id');

            if (!postId) {
                super.plugin('flashMessenger').addErrorMessage(
                    'Post id is required for preview');
                return this.plugin('redirect')
                    .toRoute('adminDashboardIndex');
            }

            // Fetch post by ID (including draft posts for preview)
            // getSinglePost(identifier, bySlug, includeDrafts)
            let post = await postService.getSinglePost(postId, false, true);

            if (!post) {
                super.plugin('flashMessenger').addErrorMessage(
                    'Post not found');
                return this.plugin('redirect')
                    .toRoute('adminDashboardIndex');
            }

            // Check if there's a draft revision for this post
            const draftRevision = await revisionService.getMostRecentDraftRevision(postId);

            // If a draft revision exists, use it for preview instead of the published post
            if (draftRevision) {
                console.log('[PostController] Draft revision found:', {
                    id: draftRevision.id,
                    presentation_style_id: draftRevision.presentation_style_id,
                    presentation_style_slug: draftRevision.presentation_style_slug,
                    presentation_css_classes: draftRevision.presentation_css_classes,
                    category_name: draftRevision.category_name
                });

                // Merge revision data into post object, keeping post.id and other metadata
                post = {
                    ...post,
                    title: draftRevision.title,
                    slug: draftRevision.slug || post.slug,
                    excerpt_markdown: draftRevision.excerpt_markdown,
                    excerpt_html: draftRevision.excerpt_html,
                    content_markdown: draftRevision.content_markdown,
                    content_html: draftRevision.content_html,
                    hero_image_url: draftRevision.hero_image_url,
                    hero_image_alt: draftRevision.hero_image_alt,
                    hero_image_caption: draftRevision.hero_image_caption,
                    meta_title: draftRevision.meta_title,
                    meta_description: draftRevision.meta_description,
                    category_id: draftRevision.category_id,
                    category_name: draftRevision.category_name,
                    category_slug: draftRevision.category_slug,
                    presentation_style_id: draftRevision.presentation_style_id,
                    presentation_style_name: draftRevision.presentation_style_name,
                    presentation_style_slug: draftRevision.presentation_style_slug,
                    presentation_css_classes: draftRevision.presentation_css_classes,
                    // Mark that we're showing a draft revision
                    _isDraftRevision: true,
                    _revisionId: draftRevision.id
                };

                console.log('[PostController] Merged post object:', {
                    id: post.id,
                    presentation_css_classes: post.presentation_css_classes,
                    presentation_style_slug: post.presentation_style_slug
                });
            } else {
                console.log('[PostController] No draft revision, using original post:', {
                    id: post.id,
                    presentation_css_classes: post.presentation_css_classes,
                    presentation_style_slug: post.presentation_style_slug
                });
            }

            // Get recent posts for sidebar (optional - for realistic preview)
            const recentPosts = await postService.getRecentPostsForSidebar();

            // Set view variables (similar to blog viewAction)
            this.getView().setVariable('post', post);
            this.getView().setVariable('recentPosts', recentPosts);
            this.getView().setVariable('isPreview', true);

            return this.getView();
        } catch (error) {
            console.error('[PostController] Error in viewAction (preview):', error);
            super.plugin('flashMessenger').addErrorMessage(
                `We're sorry — something went wrong. ` +
                `Please try again shortly`);
            return this.plugin('redirect')
                .toRoute('adminDashboardIndex');
        }
    }

    /**
     * Confirmation action
     *
     * Displays confirmation page with flash messages.
     * Shows success, error, warning, or info messages after post
     * operations.
     *
     * Features:
     * - Displays all flash message types
     * - Redirects to dashboard if no messages exist
     * - Used after successful post creation or updates
     *
     * Flash Message Types:
     * - Success: Post created/updated successfully
     * - Error: Validation or database errors
     * - Warning: Important notices (e.g., unpublish warnings)
     * - Info: General information (e.g., draft deleted)
     *
     * @returns {Response|ViewModel} Redirect to dashboard if no
     *                                messages, or view with flash
     *                                messages
     */
    confirmationAction() {
        // Check if there are any flash messages to display
        const flashMessenger = this.plugin('flashMessenger');
        const hasSuccess = flashMessenger.hasMessages('success');
        const hasError = flashMessenger.hasMessages('error');
        const hasWarning = flashMessenger.hasMessages('warning');
        const hasInfo = flashMessenger.hasMessages('info');

        // If no messages at all, redirect to dashboard
        if (!hasSuccess && !hasError && !hasWarning && !hasInfo) {
            return this.plugin('redirect')
                .toRoute('adminDashboardIndex');
        }

        // Return view to display flash messages
        return this.getView();
    }
}

module.exports = PostController;
