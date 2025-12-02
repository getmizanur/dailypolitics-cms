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
 * PostController - Manages blog post CRUD operations for admin area
 * Handles creating new posts, editing published posts via revisions,
 * listing posts with pagination, and post status management
 * Uses PostService for database operations and PostEntity for validation
 * Extends the base Controller class
 */
class PostController extends Controller {

    /**
     * Constructor
     * @param {Object} options - Controller options
     */
    constructor(options = {}) {
        super(options);
    }

    /**
     * Pre-dispatch hook - Runs before every action
     * Checks authentication for all post management actions
     * Redirects unauthenticated users to login page
     * Sets page title helper with 'Admin' suffix
     * @returns {Response|undefined} Redirect response if not authenticated
     */
    preDispatch() {
        console.log('[DashboardController.preDispatch] Called');
        // Check authentication
        const authService = this.getServiceManager()
            .get('AuthenticationService');
        if (!authService.hasIdentity()) {
            super.plugin('flashMessenger').addErrorMessage(
                'You must be logged in to access this page');
            return this.plugin('redirect').toRoute('adminLoginIndex');
        }
        console.log(
            '[DashboardController.preDispatch] About to append Admin ' +
            'to headTitle');
        this.getServiceManager().get('ViewHelperManager')
            .get('headTitle').append('Admin');
        console.log('[DashboardController.preDispatch] Finished');
    }

    /**
     * Index action - Default action for post management
     * Delegates to listAction to display post list
     * @returns {Promise<Response|ViewModel>} Result from listAction
     */
    async indexAction() {
        return this.listAction();
    }

    /**
     * List action - Displays paginated list of posts
     * Shows posts with all statuses (draft, published, archived)
     * Fetches posts and total count for pagination calculation
     * Supports page parameter from route for pagination
     * Displays 5 posts per page with numbered pagination
     * @returns {Promise<ViewModel>} View with posts and pagination data
     */
    async listAction() {
        try {
            const postService = this.getServiceManager().get('PostService');
            const page = parseInt(
                this.plugin('params').fromRoute('page')) || 1;
            const limit = 5;
            const offset = (page - 1) * limit;

            // Fetch posts with all statuses and total count for pagination
            const [posts, totalCount] = await Promise.all([
                postService.getAllPostsWithStatus(
                    ['draft', 'published', 'archived'], limit, offset),
                postService.getPostCount({ includeDrafts: true })
            ]);

            // Get recent posts for sidebar
            const recentPosts = await postService
                .getRecentPostsForSidebar();

            // Calculate pagination
            const totalPages = Math.ceil(totalCount / limit);
            // Build numbered pagination array
            const pages = [];
            for (let i = 1; i <= totalPages; i++) {
                pages.push({
                    number: i,
                    isCurrent: i === page
                });
            }

            const baseUrl = this.helper('url')
                .fromRoute('adminDashboardIndex');
            // Set view variables
            this.getView()
                .setVariable('posts', posts)
                .setVariable('pagination', {
                    mode: 'admin',
                    currentPage: page,
                    totalItems: totalCount,
                    baseUrl: baseUrl
                });

            return this.getView();

        } catch (error) {
            console.error('Error in indexAction:', error);
            throw error;
        }
    }

    /**
     * New action - Creates a new blog post
     * Displays article form on GET request
     * Processes form submission on POST request
     * Validates title (20-150 chars), excerpt (max 150 chars),
     * content (required), category (required), and meta description
     * Converts markdown to HTML for storage
     * Generates unique slug for the post
     * Supports "Save Draft" and "Publish" actions
     * Pre-populates author fields with current user
     * Redirects to confirmation page on success
     * @returns {Promise<Response|ViewModel>} Redirect on success or
     *                                         view with form
     */
    async newAction() {
        // Fetch all categories from database
        const postService = this.getServiceManager().get('PostService');

        // Create form
        const form = new ArticleForm();

        try {
            const categories = await postService.getAllCategories();

            // Add role-based button (Review for Authors,
            // Publish for Editors/Admins)
            const authService = this.getServiceManager()
                .get('AuthenticationService');
            const identity = authService.getIdentity();
            const userRole = identity?.role || 'author';
            // Get current user identity for tracking
            const currentUserId = identity?.id || null;
            const authorName = identity?.name || null;

            const actionUrl = this.helper('url')
                .fromRoute('adminDashboardNew');
            // Set form attributes
            form.setAction(actionUrl);
            form.setMethod('POST');

            // Initialize form with categories
            form.addIdField();
            form.addTitleField();
            form.addExcerptField();
            form.addContentField();
            form.addAuthorIdField();
            form.addAuthorNameField();
            form.addCategoryField('category_id', categories);
            form.addMetaDescriptionField();
            form.addCommentEnabledField();
            form.addPublishButton();
            form.addSaveButton();

            // Pre-populate author fields with current user information
            form.setData({
                author_id: currentUserId,
                author_name: authorName
            });

            // Build category names array for InArray validator
            const categoryIds = categories.map(cat => String(cat.id));

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
                                        'Title must not exceed 150 characters'
                                }
                            }
                        }
                    ]
                },
                'excerpt_markdown': {
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
                                name: "excerpt",
                                max: 150,
                                messageTemplate: {
                                    INVALID_TOO_LONG:
                                        '<strong>Excerpt</strong> must not ' +
                                        'exceed 150 characters'
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
                                        '<strong>Meta description</strong> ' +
                                        'must not exceed 150 characters'
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
                                        value === true || value === 'true' ||
                                        value === 'on') {
                                        return true;
                                    }
                                    if (value === '0' || value === 0 ||
                                        value === false ||
                                        value === 'false' || value === '' ||
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

            if (super.getRequest().isPost()) {
                const postData = super.getRequest().getPost();

                console.log("postData: " + JSON.stringify(postData));

                form.setData(postData);

                const isFormValid = form.isValid();
                if (isFormValid) {
                    const contentHtml = this.plugin('markdownToHtml')
                        .convert(postData.content_markdown);
                    const excerptHtml = this.plugin('markdownToHtml')
                        .convert(postData.excerpt_markdown);

                    const slug = await postService.generateUniqueSlug();

                    const postEntity = new PostEntity(postData);
                    const currentTimestamp = new Date().toISOString();

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

                    if (VarUtil.isset(postData.save) &&
                        postData.save === 'Save Draft') {
                        postEntity.setDraft();
                        postEntity.setUpdatedBy(currentUserId);
                    } else if (VarUtil.isset(postData.publish) &&
                               postData.publish === 'Publish') {
                        // Publish button clicked
                        postEntity.publish(currentUserId);
                        postEntity.approve(currentUserId);
                        postEntity.setUpdatedBy(currentUserId);
                    }

                    const dataForDb = postEntity.getDataForDatabase();
                    const isValid = postEntity.isValid();

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

                    if (isValid) {
                        console.log("dataForDb: " +
                            JSON.stringify(dataForDb));
                        const createPost = await postService
                            .createPost(dataForDb);
                        //log(`Post updated successfully:
                        //    ${updatedPost.slug}`);

                        // Add success message
                        super.plugin('flashMessenger').addSuccessMessage(
                            `Post saved successfully. Return back to ` +
                            `Dashboard`);

                        // Redirect to list or stay on edit page
                        return this.plugin('redirect')
                            .toRoute('adminDashboardConfirmation');
                        //return this.plugin('redirect').toRoute(
                        //    'adminDashboardEdit', { slug: updatePost.slug });
                    }
                } else {
                    // After form.isValid() returns false
                    // Get validation messages from form
                    const formMessages = form.getMessages();

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

                    // Add validation error messages for flash messenger
                    if (errorMessages.length > 0) {
                        errorMessages.forEach((message) => {
                            super.plugin('flashMessenger')
                                .addErrorMessage(message);
                        });
                    }
                }
            }

        } catch (error) {
            console.error('Error in indexAction:', error);
            throw error;
        }

        return this.getView()
            .setVariable('f', form);
    }

    /**
     * Edit action - Displays published post in read-only mode
     * Shows article form with all fields disabled (readonly)
     * Validates post ID as integer before database queries
     * Checks for existing draft revision to conditionally show buttons
     * Shows "Create Revision Draft" button only if no draft exists
     * Shows "Continue Revision Draft" button if draft exists
     * Handles form submission for creating revision or unpublishing
     * Redirects to revision creation on "Create Revision Draft" action
     * @returns {Promise<Response|ViewModel>} Redirect on form submission
     *                                         or view with readonly form
     */
    async editAction() {
        // Declare form outside try block so it's accessible
        // in return statement
        let form;

        try {
            const postService = this.getServiceManager().get('PostService');

            // Fetch all categories from database
            const categories = await postService.getAllCategories();

            // Create form
            form = new ArticleForm();

            // Get article slug
            const postId = this.plugin('params').fromRoute('id');

            const actionUrl = this.helper('url')
                .fromRoute('adminDashboardEdit', { id : postId });

            // Set form attributes
            form.setAction(actionUrl);
            form.setMethod('POST');

            // Initialize form with categories
            form.addIdField();
            form.addAuthorIdField();
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

            // Add role-based button (Review for Authors,
            // Publish for Editors/Admins)
            const authService = this.getServiceManager()
                .get('AuthenticationService');
            const identity = authService.getIdentity();
            const userRole = identity?.role || 'author';
            // Get current user identity for tracking
            const currentUserId = identity?.id || null;

            /*if (userRole === 'author') {
                form.addReviewButton();
            } else if (userRole === 'editor' || userRole === 'admin') {
                form.addPublishButton();
            }*/

            // Validate post_id before using it
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
                return this.plugin('redirect').toRoute('adminDashboard');
            }

            // Convert postId to integer after validation
            const postIdInt = parseInt(postId, 10);

            // Check for existing draft revision to conditionally
            // render button
            const postRevisionService = this.getServiceManager()
                .get('PostRevisionService');
            let draftRevision = null;

            try {
                draftRevision = await postRevisionService
                    .getMostRecentDraftRevision(postIdInt);

                if (draftRevision) {
                    form.addContinueRevisionDraft();
                } else {
                    console.log(
                        '[EditAction] No draft revision found for post:',
                        postIdInt);
                    // Only show "Create Revision Draft" button
                    // if no draft exists
                    form.addCreateRevisionDraftButton();
                }
            } catch (error) {
                console.error(
                    '[EditAction] Error checking for draft revision:',
                    error);
                // On error, still show the button (fail-safe)
                form.addCreateRevisionDraftButton();
            }

            form.addUnpublishButton();

            // Fetch and populate post data (postId already validated above)
            const post = await postService.getSinglePost(
                postIdInt, false, true);
            if (post) {
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
                    comment_enabled: post.comment_enabled || 0
                });
            }

            // Handle form submission
            if (super.getRequest().isPost()) {
                const postData = super.getRequest().getPost();

                if (VarUtil.isset(postData.create_revision_draft) &&
                    postData.create_revision_draft ===
                    'Create Revision Draft') {
                    return this.plugin('redirect')
                        .toRoute('adminRevisionNew',
                            { post_id: postIdInt });
                } else if (VarUtil.isset(postData.unpublish) &&
                           postData.unpublish === 'Unpublish') {
                    // Handle unpublish action
                }
                super.plugin('flashMessenger').addErrorMessage(
                    `We're sorry — something went wrong. ` +
                    `Please let us know and try again shortly`);
            }
        } catch (error) {
            const errorMsg = `Error in editAction: ${error.message}\n` +
                `Stack: ${error.stack}`;
            throw error;
        }

        return this.getView()
            .setVariable('f', form);
        //.setVariable('flashMessages', flashMessages);
    }

    /**
     * Confirmation action - Displays confirmation page
     * Shows flash messages (success, error, warning, info)
     * Redirects to dashboard if no messages exist
     * Used after successful post creation or updates
     * @returns {Response|ViewModel} Redirect to dashboard if no messages,
     *                                or view with flash messages
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
            return this.plugin('redirect').toRoute('adminDashboardIndex');
        }

        return this.getView();
    }
}

module.exports = PostController;
