const Controller = require(global.applicationPath('/library/mvc/controller/base-controller'));
const ArticleForm = require(global.applicationPath('/application/form/article-form'));
const InputFilter = require(global.applicationPath('/library/input-filter/input-filter'));
const VarUtil = require(global.applicationPath('/library/util/var-util'));
const JsonUtil = require(global.applicationPath('/library/util/json-util'));
const PostEntity = require('../../../entity/post-entity');

class RevisionController extends Controller {

    constructor(options = {}) {
        super(options);
    }

    preDispatch() {
        console.log('[DashboardController.preDispatch] Called');
        // Check authentication
        const authService = this.getServiceManager().get('AuthenticationService');
        if (!authService.hasIdentity()) {
            super.plugin('flashMessenger').addErrorMessage('You must be logged in to access this page');
            return this.plugin('redirect').toRoute('adminLoginIndex');
        }
        console.log('[DashboardController.preDispatch] About to append Admin to headTitle');
        this.getServiceManager().get('ViewHelperManager').get('headTitle').append('Admin');
        console.log('[DashboardController.preDispatch] Finished');
    }

    async newAction() {
        const postService = this.getServiceManager().get('PostService');
        const postRevisionService = this.getServiceManager().get('PostRevisionService');

        try {
            const categories = await postService.getAllCategories();

            // Add role-based button (Review for Authors, Publish for Editors/Admins)
            const authService = this.getServiceManager().get('AuthenticationService');
            const identity = authService.getIdentity();
            const userRole = identity?.role || 'author'; // Default to 'author' if role not found
            // Get current user identity for tracking
            const currentUserId = identity?.id || null;
            const authorName = identity?.name || null;

            // Get article post id
            const postId = this.plugin('params').fromRoute('post_id');

            // Validate post_id before using it
            const postIdFilter = InputFilter.factory({
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

            postIdFilter.setData({ post_id: postId });

            // Only proceed if postId is valid
            if(!postIdFilter.isValid()) {
                // Invalid post ID - redirect to dashboard
                this.plugin('flashMessenger')
                    .addMessage('Invalid post ID provided', 'error');
                return this.plugin('redirect').toRoute('adminDashboard');
            }

            // Convert postId to integer after validation
            const postIdInt = parseInt(postId, 10);

            // Check if a draft revision already exists for this post
            const postRevisionService = this.getServiceManager()
                .get('PostRevisionService');
            let existingDraft = null;

            try {
                existingDraft = await postRevisionService
                    .getMostRecentDraftRevision(postIdInt);

                if (existingDraft) {
                    console.log(
                        '[NewAction] Draft revision already exists:',
                        {
                            id: existingDraft.id,
                            title: existingDraft.title,
                            created_by: existingDraft.created_by_name,
                            created_at: existingDraft.created_at
                        });

                    // Redirect to edit the existing draft instead
                    this.plugin('flashMessenger').addMessage(
                        'A draft revision already exists for this post. ' +
                        'Please edit the existing draft.',
                        'warning');
                    return this.plugin('redirect').toRoute(
                        'adminRevisionEdit',
                        { post_id : postIdInt, id: existingDraft.id });
                }

                console.log(
                    '[NewAction] No existing draft found for post:',
                    postIdInt);
            } catch (error) {
                console.error(
                    '[NewAction] Error checking for existing draft:',
                    error);
                // On error, show error message and redirect
                this.plugin('flashMessenger').addErrorMessage(
                    'An error occurred while checking for existing drafts',
                    'error');
                return this.plugin('redirect').toRoute('adminDashboard');
            }

        } catch (error) {
            console.error('Error in indexAction:', error);
            throw error;
        }

        return this.getView();
    }

    async newTestAction() {
        // Fetch all categories from database
        const postService = this.getServiceManager().get('PostService');

        // Create form
        const form = new ArticleForm();

        try {
            const categories = await postService.getAllCategories();

            // Add role-based button (Review for Authors, Publish for Editors/Admins)
            const authService = this.getServiceManager().get('AuthenticationService');
            const identity = authService.getIdentity();
            const userRole = identity?.role || 'author'; // Default to 'author' if role not found
            // Get current user identity for tracking
            const currentUserId = identity?.id || null;
            const authorName = identity?.name || null;

            // Get article post id
            const postId = this.plugin('params').fromRoute('post_id');

            // Validate post_id before using it
            const postIdFilter = InputFilter.factory({
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

            postIdFilter.setData({ post_id: postId });

            // Only proceed if postId is valid
            if(!postIdFilter.isValid()) {
                // Invalid post ID - redirect to dashboard
                this.plugin('flashMessenger')
                    .addMessage('Invalid post ID provided', 'error');
                return this.plugin('redirect').toRoute('adminDashboard');
            }

            // Convert postId to integer after validation
            const postIdInt = VarUtil.intval(postId);

            const actionUrl = this.helper('url').fromRoute('adminRevisionNew',
                {post_id : postIdInt});
            // Set form attributes
            form.setAction(actionUrl);
            form.setMethod('POST');

            // Initialize form with categories
            form.addIdField();
            form.addSlugField();
            form.addTitleField();
            form.addExcerptField();
            form.addContentField();
            form.addAuthorIdField();
            form.addAuthorNameField();
            form.addCategoryField('category_id', categories);
            form.addMetaDescriptionField();
            form.addCommentEnabledField();

            form.addSaveRevisionDraftButton();
            form.addPublishRevisionButton();
            form.addDeleteDraftButton();

            // Pre-populate author fields with current user information
            form.setData({
                author_id: currentUserId,
                author_name: authorName
            });

            // If editing existing article, fetch and populate data
            if (postIdInt) {
                const article = await postService.getSinglePost(postIdInt, false, true);
                if (article) {
                    form.setData({
                        id: article.id,
                        slug: article.slug,
                        title: article.title,
                        excerpt_markdown: article.excerpt_markdown,
                        content_markdown: article.content_markdown,
                        author_id: article.author_id,
                        author_name: article.author_name,
                        category_id: article.category_id,
                        meta_description: article.meta_description,
                        comment_enabled: article.comment_enabled || 0
                    });
                }
            }

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
                'category_id': {
                    required: true,
                    requiredMessage: "<strong>Category</strong> is required. Please select a category",
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
                                NOT_IN_ARRAY: 'Please select a valid category'
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
                                    INVALID_TOO_LONG: '<strong>Meta description</strong> must not exceed 150 characters'
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
                                    // Accept '1', 1, true, 'true', 'on' for checked
                                    // Accept '0', 0, false, 'false', '', null, undefined for unchecked
                                    if (value === '1' || value === 1 || value === true || value === 'true' || value === 'on') {
                                        return true;
                                    }
                                    if (value === '0' || value === 0 || value === false || value === 'false' || value === '' || value === null || value === undefined) {
                                        return true;
                                    }
                                    return false;
                                },
                                messageTemplate: {
                                    INVALID: 'Invalid value for comment enabled'
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
                    const contentHtml = this.plugin('markdownToHtml').convert(postData.content_markdown);
                    const excerptHtml = this.plugin('markdownToHtml').convert(postData.excerpt_markdown);

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
                        .setCommentsEnabled(postData.comments_enabled === '1' || postData.comments_enabled === true || postData.comments_enabled === 'on')
                        .setRegenerateStatic(postData.regenerate_static || false)
                        .setReviewRequested(postData.review_requested || false)
                        .setCreatedAt(currentTimestamp)
                        .setUpdatedAt(currentTimestamp);
                    // Note: published_at, deleted_at, approved_at, etc. are NOT set here for new posts
                    // They remain null and will be set when the post is published/deleted/approved

                    if (VarUtil.isset(postData.save) && postData.save === 'Save Draft') {
                        postEntity.setDraft();
                        postEntity.setUpdatedBy(currentUserId);
                    } else if (VarUtil.isset(postData.publish) && postData.publish === 'Publish') {
                        // Publish button clicked
                        postEntity.publish(currentUserId);
                        postEntity.approve(currentUserId);
                        postEntity.setUpdatedBy(currentUserId);
                    }

                    const dataForDb = postEntity.getDataForDatabase();
                    const isValid = postEntity.isValid();

                    if (!isValid) {
                        const invalidInputs = postEntity.getInputFilter().getInvalidInputs();
                        console.log("\n=== VALIDATION ERRORS ===");
                        Object.keys(invalidInputs).forEach((fieldName) => {
                            const messages = invalidInputs[fieldName].getMessages();
                            const value = postEntity.get(fieldName);
                            console.log(`Field: ${fieldName}`);
                            console.log(`  Value: "${value}"`);
                            console.log(`  Errors: ${messages.join(', ')}`);
                        });
                        console.log("========================\n");
                    }

                    if (isValid) {
                        console.log("dataForDb: " + JSON.stringify(dataForDb));
                        const createPost = await postService.createPost(dataForDb);
                        //log(`Post updated successfully: ${updatedPost.slug}`);

                        // Add success message
                        super.plugin('flashMessenger').addSuccessMessage(
                            `Post saved successfully. Return back to Dashboard`);

                        // Redirect to list or stay on edit page
                        return this.plugin('redirect').toRoute('adminDashboardConfirmation');
                        //return this.plugin('redirect').toRoute('adminDashboardEdit', { slug: updatePost.slug });
                    }
                } else {
                    // After form.isValid() returns false
                    // Get validation messages from form
                    const formMessages = form.getMessages();

                    Object.keys(formMessages).forEach((fieldName) => {
                        if (form.has(fieldName)) {
                            console.log("errorMessages: " + formMessages[fieldName]);
                            console.log("errorFieldName: " + fieldName);
                            form.get(fieldName).setMessages(formMessages[fieldName]);
                        }
                    });

                    // Extract error messages for flash messenger
                    let errorMessages = [];
                    Object.keys(formMessages).forEach((fieldName) => {
                        const fieldMessages = formMessages[fieldName];
                        if (Array.isArray(fieldMessages)) {
                            errorMessages = errorMessages.concat(fieldMessages);
                        } else {
                            errorMessages.push(fieldMessages);
                        }
                    });

                    // Add validation error messages for flash messenger
                    if (errorMessages.length > 0) {
                        errorMessages.forEach((message) => {
                            super.plugin('flashMessenger').addErrorMessage(message);
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

    async editAction() {
        let form; // Declare form outside try block so it's accessible in return statement

        try {
            const postService = this.getServiceManager().get('PostService');

            // Fetch all categories from database
            const categories = await postService.getAllCategories();

            // Create form
            form = new ArticleForm();

            // Get article slug
            const articleSlug = this.plugin('params').fromRoute('slug');

            const actionUrl = this.helper('url')
                .fromRoute('adminDashboardEdit', { slug: articleSlug });

            // Set form attributes
            form.setAction(actionUrl);
            form.setMethod('POST');

            // Initialize form with categories
            form.addIdField();
            form.addAuthorIdField();
            form.addSlugField();
            form.addTitleField();
            form.addExcerptField();
            form.addContentField();
            form.addAuthorNameField();
            form.addCategoryField('category_id', categories);
            form.addMetaDescriptionField();

            form.addDeleteButton();

            // Add role-based button (Review for Authors, Publish for Editors/Admins)
            const authService = this.getServiceManager().get('AuthenticationService');
            const identity = authService.getIdentity();
            const userRole = identity?.role || 'author'; // Default to 'author' if role not found
            // Get current user identity for tracking
            const currentUserId = identity?.id || null;

            /*if (userRole === 'author') {
                form.addReviewButton();
            } else if (userRole === 'editor' || userRole === 'admin') {
                form.addPublishButton();
            }*/

            form.addCreateRevision();
            form.addUnpublishButton();

            // If editing existing article, fetch and populate data
            if (articleSlug) {
                const article = await postService.getSinglePost(articleSlug, true, true);
                if (article) {
                    form.setData({
                        id: article.id,
                        slug: article.slug,
                        title: article.title,
                        excerpt_markdown: article.excerpt_markdown,
                        content_markdown: article.content_markdown,
                        author_id: article.author_id,
                        author_name: article.author_name,
                        category_id: article.category_id,
                        meta_description: article.meta_description,
                        comment_enabled: article.comment_enabled || 0
                    });
                }
            }

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
                'category_id': {
                    required: true,
                    requiredMessage: "<strong>Category</strong> is required. Please select a category",
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
                                NOT_IN_ARRAY: 'Please select a valid category'
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
                                    INVALID_TOO_LONG: '<strong>Meta description</strong> must not exceed 150 characters'
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
                                    // Accept '1', 1, true, 'true', 'on' for checked
                                    // Accept '0', 0, false, 'false', '', null, undefined for unchecked
                                    if (value === '1' || value === 1 || value === true || value === 'true' || value === 'on') {
                                        return true;
                                    }
                                    if (value === '0' || value === 0 || value === false || value === 'false' || value === '' || value === null || value === undefined) {
                                        return true;
                                    }
                                    return false;
                                },
                                messageTemplate: {
                                    INVALID: 'Invalid value for comment enabled'
                                }
                            }
                        }
                    ]
                }
            });
            form.setInputFilter(inputFilter);

            if (super.getRequest().isPost()) {
                const postData = super.getRequest().getPost();

                form.setData(postData);

                const isFormValid = form.isValid();

                if (isFormValid) {
                    // Update post by slug
                    try {
                        const contentHtml = this.plugin('markdownToHtml').convert(postData.content_markdown);
                        const excerptHtml = this.plugin('markdownToHtml').convert(postData.excerpt_markdown);

                        const postEntity = new PostEntity(postData);
                        postEntity
                            .setSlug(postData.slug)
                            .setTitle(postData.title)
                            .setExcerptMarkdown(postData.excerpt_markdown)
                            .setExcerptHtml(excerptHtml)
                            .setContentMarkdown(postData.content_markdown)
                            .setContentHtml(contentHtml)
                            .setAuthorId(postData.author_id)
                            .setCategoryId(postData.category_id)
                            .setCommentsEnabled(postData.comments_enabled === '1' || postData.comments_enabled === true || postData.comments_enabled === 'on')
                            .setStatus(postData.status || 'draft')
                            .setRegenerateStatic(postData.regenerate_static || false)
                            .setReviewRequested(postData.review_requested || false)
                            .setPublishedAt(postData.published_at)
                            .setUpdatedAt(postData.updated_at)
                            .setDeletedAt(postData.deleted_at)
                            .setApprovedAt(postData.approved_at)
                            .setUpdatedBy(postData.updated_by)
                            .setDeletedBy(postData.deleted_by)
                            .setApprovedBy(postData.approved_by)
                            .setPublishedBy(postData.published_by);

                        // Check which submit button was clicked and handle accordingly
                        if (VarUtil.isset(postData.save) && postData.save === 'Save Draft') {
                            // Save Draft button clicked
                            postEntity.setDraft();
                            postEntity.setUpdatedBy(currentUserId);
                        } else if (VarUtil.isset(postData.review_requested) && postData.review_requested === 'Submit for Review') {
                            // Submit for Review button clicked
                            postEntity.requestReview();
                            postEntity.setUpdatedBy(currentUserId);
                        } else if (VarUtil.isset(postData.publish) && postData.publish === 'Publish') {
                            // Publish button clicked
                            postEntity.publish(currentUserId);
                            postEntity.approve(currentUserId);
                            postEntity.setUpdatedBy(currentUserId);
                        } else if (VarUtil.isset(postData.delete) && postData.delete === 'Delete') {
                            // Delete button clicked
                            postEntity.softDelete(currentUserId)
                            postEntity.setUpdatedBy(currentUserId);
                        }

                        const dataForDb = postEntity.getObjectCopy();
                        JsonUtil.unset(dataForDb, 'id');
                        JsonUtil.unset(dataForDb, 'created_at');
                        JsonUtil.unset(dataForDb, 'updated_at');

                        if (postEntity.isValid()) {
                            const updatedPost = await postService.updatePostBySlug(postData.slug, dataForDb);
                            //log(`Post updated successfully: ${updatedPost.slug}`);

                            // Add success message
                            super.plugin('flashMessenger').addSuccessMessage(
                                `Post saved successfully. Return back to Dashboard`);

                            // Redirect to list or stay on edit page
                            return this.plugin('redirect').toRoute('adminDashboardConfirmation');
                            //return this.plugin('redirect').toRoute('adminDashboardEdit', { slug: updatePost.slug });
                        }
                    } catch (error) {
                        super.plugin('flashMessenger').addErrorMessage(`Failed to update post: ${error.message}`);
                    }
                } else {
                    // After form.isValid() returns false
                    // Get validation messages from form
                    const formMessages = form.getMessages();

                    Object.keys(formMessages).forEach((fieldName) => {
                        if (form.has(fieldName)) {
                            form.get(fieldName).setMessages(formMessages[fieldName]);
                        }
                    });

                    // Extract error messages for flash messenger
                    let errorMessages = [];
                    Object.keys(formMessages).forEach((fieldName) => {
                        const fieldMessages = formMessages[fieldName];
                        if (Array.isArray(fieldMessages)) {
                            errorMessages = errorMessages.concat(fieldMessages);
                        } else {
                            errorMessages.push(fieldMessages);
                        }
                    });

                    // Add validation error messages for flash messenger
                    if (errorMessages.length > 0) {
                        errorMessages.forEach((message) => {
                            super.plugin('flashMessenger').addErrorMessage(message);
                        });
                    }
                }
            } else {
                form.populateValues(this.getRequest().getPost());
            }

        } catch (error) {
            const errorMsg = `Error in editAction: ${error.message}\nStack: ${error.stack}`;
            throw error;
        }

        return this.getView()
            .setVariable('f', form);
        //.setVariable('flashMessages', flashMessages);
    }

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

module.exports = RevisionController;
