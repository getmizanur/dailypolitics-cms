const Controller = require(
    global.applicationPath('/library/mvc/controller/base-controller'));
const ArticleForm = require(
    global.applicationPath('/application/form/article-form'));
const InputFilter = require(
    global.applicationPath('/library/input-filter/input-filter'));
const VarUtil = require(
    global.applicationPath('/library/util/var-util'));
const JsonUtil = require(
    global.applicationPath('/library/util/json-util'));
const PostEntity = require('../../../entity/post-entity');
const PostRevisionEntity = require('../../../entity/post-revision-entity');

/**
 * RevisionController
 *
 * Manages post revision operations for the admin area.
 * Handles creating, editing, and publishing revision drafts for
 * published posts.
 *
 * Key Features:
 * - Create new revision drafts from published posts
 * - Edit existing revision drafts
 * - Publish revisions to update live posts
 * - Delete revision drafts
 * - Prevent multiple draft revisions for same post
 * - Track revision history and audit trail
 *
 * Revision Workflow:
 * 1. User views published post (read-only)
 * 2. Creates revision draft (copy of published post)
 * 3. Edits revision draft (all fields editable)
 * 4. Saves draft or publishes revision
 * 5. Published revision updates live post and marks revision as
 *    superseded
 *
 * Uses PostRevisionService for database operations and
 * PostRevisionEntity for validation.
 * Extends the base Controller class for MVC pattern.
 *
 * @extends Controller
 */
class RevisionController extends Controller {

    /**
     * Constructor
     *
     * Initializes the RevisionController with optional configuration.
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
        console.log('[RevisionController.preDispatch] Called');

        // Check authentication - all revision management requires
        // login
        const authService = this.getServiceManager()
            .get('AuthenticationService');

        if (!authService.hasIdentity()) {
            super.plugin('flashMessenger').addErrorMessage(
                'You must be logged in to access this page');
            return this.plugin('redirect').toRoute('adminLoginIndex');
        }

        console.log(
            '[RevisionController.preDispatch] About to append Admin ' +
            'to headTitle');

        // Add 'Admin' to page title for all admin pages
        this.getServiceManager().get('ViewHelperManager')
            .get('headTitle').append('Admin');

        console.log('[RevisionController.preDispatch] Finished');
    }

    /**
     * New action
     *
     * Creates a new revision draft from a published post.
     * Checks if draft revision already exists and redirects to edit
     * if found.
     * Creates new draft revision from published post data if no
     * existing draft.
     *
     * Features:
     * - Validates post ID parameter
     * - Checks for existing draft revision
     * - Redirects to edit existing draft if found
     * - Creates new draft from published post data
     * - Copies all content fields (title, excerpt, content, etc.)
     * - Sets status to 'draft' and tracks creator
     * - Redirects to edit newly created draft
     *
     * Route Parameters:
     * - post_id: ID of published post to create revision for
     *
     * Business Rules:
     * - Only one draft revision per post allowed at a time
     * - Draft must be from published post (not another draft)
     * - All content copied from current published version
     *
     * Error Handling:
     * - Invalid post ID: Redirect to dashboard
     * - Post not found: Show error and redirect to dashboard
     * - Draft already exists: Redirect to edit existing draft
     * - Database error: Show error and redirect to dashboard
     *
     * @returns {Promise<Response>} Redirect to edit draft revision
     */
    async newAction() {
        const postService = this.getServiceManager()
            .get('PostService');
        const postRevisionService = this.getServiceManager()
            .get('PostRevisionService');

        const categories = await postService.getAllCategories();

        // Get current user identity for tracking
        const authService = this.getServiceManager()
            .get('AuthenticationService');
        const identity = authService.getIdentity();
        const userRole = identity?.role || 'author';
        const currentUserId = identity?.id || null;
        const authorName = identity?.name || null;

        // Get post ID from route parameter
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
        let existingDraft = null;

        try {
            // Check for existing draft revision
            existingDraft = await postRevisionService
                .getMostRecentDraftRevision(postIdInt);

            if (existingDraft) {
                // Draft already exists - redirect to edit it instead
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

            // No existing draft found - create a new one
            console.log(
                '[NewAction] No existing draft found for post:',
                postIdInt);

            // Fetch the published post data to create revision from
            const post = await postService.getSinglePost(
                postIdInt, false, true);

            if (!post) {
                // Post not found - show error
                console.error('[NewAction] Post not found:', postIdInt);
                this.plugin('flashMessenger').addMessage(
                    'Post not found',
                    'error');
                return this.plugin('redirect')
                    .toRoute('adminDashboardIndex');
            }

            console.log(
                '[NewAction] Creating new draft revision for post:',
                post.title);

            // Create new draft revision from published post data
            const revisionData = {
                post_id: postIdInt,
                title: post.title,
                excerpt_markdown: post.excerpt_markdown,
                excerpt_html: post.excerpt_html,
                content_markdown: post.content_markdown,
                content_html: post.content_html,
                meta_title: post.meta_title,
                meta_description: post.meta_description,
                category_id: post.category_id,
                presentation_style_id: post.presentation_style_id,
                change_reason: null,
                status: 'draft',
                created_by: currentUserId
            };

            // Create the revision in database
            const newRevision = await postRevisionService
                .createRevision(revisionData);

            console.log(
                '[NewAction] Successfully created draft revision:',
                newRevision.id);

            // Redirect to edit the newly created draft
            this.plugin('flashMessenger').addInfoMessage({
                title : 'Revision draft created',
                message : 'Draft revision created successfully'
            });
            return this.plugin('redirect').toRoute(
                'adminRevisionEdit',
                { post_id: postIdInt, id: newRevision.id });

        } catch (error) {
            // Database or service error
            console.error(
                '[NewAction] Error checking for existing draft:',
                error);
            // On error, show error message and redirect
            this.plugin('flashMessenger').addErrorMessage(
                'An error occurred while checking for existing drafts',
                'error');
            return this.plugin('redirect')
                .toRoute('adminDashboardIndex');
        }

        return this.getView();
    }

    /**
     * Edit action
     *
     * Displays and handles editing of revision drafts.
     * All fields are editable unlike published posts.
     *
     * Features:
     * - Displays article form with all fields editable
     * - Validates all required and optional fields
     * - Converts markdown to HTML for storage
     * - Supports "Save Revision Draft", "Publish Revision", "Delete
     *   Draft", and "Exit" actions
     * - Tracks revision creator and approver
     * - Redirects based on action taken
     *
     * Route Parameters:
     * - post_id: ID of parent published post
     * - id: ID of revision draft to edit
     *
     * Form Actions:
     * - Save Revision Draft: Updates revision with status 'draft'
     * - Publish Revision: Publishes revision to update live post,
     *                      marks revision as 'superseded'
     * - Delete Draft: Permanently removes revision draft
     * - Exit: Returns to post edit page without changes
     *
     * Validation Rules:
     * - Title: Required, 20-150 characters
     * - Excerpt: Optional, max 150 characters
     * - Content: Required
     * - Category: Required, must be valid category ID
     * - Meta Description: Optional, max 150 characters
     * - Change Reason: Required only when publishing revision
     *
     * Publishing Workflow:
     * 1. Saves revision data to post_revisions for audit trail
     * 2. Updates published post with revision content
     * 3. Marks revision as 'superseded' with approval tracking
     * 4. Marks other revisions for same post as 'superseded'
     * 5. Sets regenerate_static flag for static site generation
     *
     * Error Handling:
     * - Invalid post/revision ID: Redirect based on which is invalid
     * - Validation errors: Re-display form with error messages
     * - Database errors: Throw error (caught by error handler)
     *
     * @returns {Promise<Response|ViewModel>} Redirect on form
     *                                         submission or view with
     *                                         form
     */
    async editAction() {
        // Fetch all categories from database
        const postService = this.getServiceManager().get('PostService');

        // Create form
        const form = new ArticleForm();

        const categories = await postService.getAllCategories();

        // Get current user identity for tracking
        const authService = this.getServiceManager()
            .get('AuthenticationService');
        const identity = authService.getIdentity();
        const userRole = identity?.role || 'author';
        const currentUserId = identity?.id || null;
        const authorName = identity?.name || null;

        // Get route parameters
        const postId = this.plugin('params').fromRoute('post_id');
        const revisionId = this.plugin('params').fromRoute('id');

        // Validate post_id and revision_id before using them
        const postAndRevisionIdFilter = InputFilter.factory({
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
                            INVALID:
                                'Please provide valid post ID'
                        }
                    }
                ]
            },
            'id': {
                required: true,
                requiredMessage: "Revision ID is required",
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
                                'Please provide valid revision ID'
                        }
                    }
                ]
            }
        });

        postAndRevisionIdFilter.setData({
            post_id: postId,
            id : revisionId
        });

        // Check validation and redirect based on which field is
        // invalid
        if(!postAndRevisionIdFilter.isValid()) {
            const messages = postAndRevisionIdFilter.getMessages();

            // Check which field(s) are invalid
            const postIdInvalid = messages.post_id &&
                messages.post_id.length > 0;
            const idInvalid = messages.id &&
                messages.id.length > 0;

            // Both invalid - redirect to dashboard index
            if (postIdInvalid && idInvalid) {
                this.plugin('flashMessenger')
                    .addErrorMessage('Invalid post ID and ' +
                        'revision ID provided', 'error');
                return this.plugin('redirect')
                    .toRoute('adminDashboardIndex');
            }

            // Only post_id invalid - redirect to dashboard index
            if (postIdInvalid) {
                this.plugin('flashMessenger')
                    .addErrorMessage('Invalid post ID provided',
                        'error');
                return this.plugin('redirect')
                    .toRoute('adminDashboardIndex');
            }

            // Only id (revision_id) invalid - redirect to
            // dashboard edit
            if (idInvalid) {
                this.plugin('flashMessenger')
                    .addErrorMessage('Invalid revision ID ' +
                        'provided', 'error');
                return this.plugin('redirect')
                    .toRoute('adminDashboardEdit', {
                        id : postAndRevisionIdFilter
                            .getValue('post_id')
                    });
            }
        }

        // Convert postId and revisionId to integer after
        // validation
        const postIdInt = VarUtil.intval(postId);
        const revisionIdInt = VarUtil.intval(revisionId);

        // Set form attributes
        const actionUrl = this.helper('url').fromRoute(
            'adminRevisionEdit',
            {post_id : postIdInt, id : revisionIdInt});
        form.setAction(actionUrl);
        form.setMethod('POST');

        // Initialize form fields
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
        form.addChangeReasonField();

        // Add action buttons
        form.addSaveRevisionDraftButton();
        form.addPublishRevisionButton();
        form.addDeleteDraftButton();
        form.addExitThisPageButton();

        // Get post revision service
        const postRevisionService = this.getServiceManager()
            .get('PostRevisionService');

        // Fetch and populate revision data
        if (revisionIdInt) {
            const revision = await postRevisionService
                .getRevisionById(revisionIdInt);

            if (revision) {
                // Fetch the original post to get the slug
                const post = await postService.getSinglePost(
                    postIdInt, false, true);

                // Populate form with revision data
                // Get comments_enabled from the post (not revision)
                // as it's not a content change and not stored in revisions
                const commentsEnabledValue = post && post.comments_enabled ? '1' : '0';

                form.setData({
                    id: revision.id,
                    slug: post ? post.slug : '',
                    title: revision.title,
                    excerpt_markdown: revision.excerpt_markdown,
                    content_markdown: revision.content_markdown,
                    category_id: revision.category_id,
                    meta_description: revision.meta_description,
                    comments_enabled: commentsEnabledValue,
                    change_reason: revision.change_reason,
                    // Show the original creator of the revision
                    author_id: revision.created_by,
                    author_name: revision.created_by_name
                });
            }
        }

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
            },
            'change_reason': {
                required: false,
                filters: [
                    { name: 'HtmlEntities' },
                    { name: 'StringTrim' },
                    { name: 'StripTags' }
                ]
            }
        });
        form.setInputFilter(inputFilter);

        // Handle POST request - form submission
        if (super.getRequest().isPost()) {
            const postData = super.getRequest().getPost();

            console.log("postData: " + JSON.stringify(postData));

            // Check if "Publish Revision" button was clicked
            const isPublishRevision = VarUtil.isset(
                postData.publish_revision) &&
                postData.publish_revision === 'Publish revision';

            // If publishing revision, make change_reason required
            if (isPublishRevision) {
                inputFilter.get('change_reason')
                    .setRequired(true);
                inputFilter.get('change_reason')
                    .setRequiredMessage(
                        '<strong>Change reason</strong> is ' +
                        'required when publishing a revision');
            }

            form.setData(postData);

            const isFormValid = form.isValid();
            if (isFormValid) {
                // Convert markdown to HTML
                const contentHtml = this.plugin('markdownToHtml')
                    .convert(postData.content_markdown);
                const excerptHtml = this.plugin('markdownToHtml')
                    .convert(postData.excerpt_markdown);

                // Create PostRevisionEntity with form data
                const revisionEntity = new PostRevisionEntity(
                    postData);
                const currentTimestamp = new Date().toISOString();

                // Build revision entity
                // Note: comments_enabled is NOT stored in revisions table
                // It's only stored in posts table and updated separately
                revisionEntity
                    .setPostId(postIdInt)
                    .setTitle(postData.title)
                    .setExcerptMarkdown(postData.excerpt_markdown)
                    .setExcerptHtml(excerptHtml)
                    .setContentMarkdown(postData.content_markdown)
                    .setContentHtml(contentHtml)
                    .setCategoryId(postData.category_id)
                    .setMetaDescription(postData.meta_description)
                    .setChangeReason(postData.change_reason)
                    .setCreatedBy(currentUserId);

                // Determine which button was clicked
                const isSaveDraft = VarUtil.isset(
                    postData.save_revision_draft) &&
                    postData.save_revision_draft ===
                    'Save revision draft';
                const isPublishRevision = VarUtil.isset(
                    postData.publish_revision) &&
                    postData.publish_revision ===
                    'Publish revision';
                const isDeleteDraft = VarUtil.isset(
                    postData.delete_draft) &&
                    postData.delete_draft === 'Delete draft';
                const isExitThisPage = VarUtil.isset(
                    postData.exit_this_page) &&
                    postData.exit_this_page === 'Exit this page';

                // Handle exit this page action first (doesn't
                // need validation)
                if (isExitThisPage) {
                    // Simply redirect to post edit page without
                    // any changes
                    return this.plugin('redirect')
                        .toRoute('adminDashboardEdit',
                            { id: postIdInt });
                }

                // Handle delete draft action (doesn't need
                // validation)
                if (isDeleteDraft) {
                    // Delete the revision draft
                    await postRevisionService.deleteRevision(
                        revisionIdInt);

                    // Add information message
                    super.plugin('flashMessenger')
                        .addWarningMessage({
                            title: 'Draft deleted',
                            message: 'Revision draft has been ' +
                                'deleted'
                        });

                    // Redirect to post edit page
                    return this.plugin('redirect')
                        .toRoute('adminDashboardEdit',
                            { id: postIdInt });
                }

                // Set revision status based on action
                if (isSaveDraft) {
                    // Save as draft revision
                    revisionEntity.setDraft();
                } else if (isPublishRevision) {
                    // Mark revision as approved
                    revisionEntity.approve(currentUserId);
                }

                // Validate revision entity
                const isValid = revisionEntity.isValid();

                // Log validation errors if any
                if (!isValid) {
                    const invalidInputs = revisionEntity
                        .getInputFilter()
                        .getInvalidInputs();
                    console.log("\n=== VALIDATION ERRORS ===");
                    Object.keys(invalidInputs)
                        .forEach((fieldName) => {
                            const messages =
                                invalidInputs[fieldName]
                                    .getMessages();
                            const value = revisionEntity
                                .get(fieldName);
                            console.log(`Field: ${fieldName}`);
                            console.log(`  Value: "${value}"`);
                            console.log(`  Errors: ` +
                                `${messages.join(', ')}`);
                        });
                    console.log("========================\n");
                }

                if (isValid) {
                    // Convert comments_enabled to boolean for posts table update
                    // Filter already converted array to '1' or '0'
                    const commentsValue = inputFilter.getValue('comments_enabled');
                    const commentsEnabled =
                        commentsValue === '1' ||
                        commentsValue === 1 ||
                        commentsValue === true;

                    // Get data formatted for database operation
                    const dataForDb = revisionEntity
                        .getDataForDatabase(
                            revisionIdInt ? true : false);
                    console.log("Revision dataForDb: " +
                        JSON.stringify(dataForDb));

                    if (isSaveDraft) {
                        // Update revision draft in post_revisions table
                        const updatedRevision =
                            await postRevisionService
                                .updateRevision(
                                    revisionIdInt, dataForDb);

                        // Also update comments_enabled in posts table
                        // (not a content change, but a post setting)
                        await postService.updatePostById(postIdInt, {
                            comments_enabled: commentsEnabled,
                            updated_by: currentUserId
                        });

                        // Add information message
                        super.plugin('flashMessenger')
                            .addInfoMessage({
                                title : 'Changes saved',
                                message : 'Revision draft saved ' +
                                    'successfully'
                            });

                        // Redirect back to edit page
                        return this.plugin('redirect')
                            .toRoute('adminRevisionEdit',
                                { post_id: postIdInt,
                                  id: revisionIdInt });

                    } else if (isPublishRevision) {
                        // Publishing workflow:
                        // 1. Save revision data to post_revisions
                        //    for audit trail
                        // 2. Update published post with revision
                        //    content
                        // 3. Mark revision as superseded with
                        //    approval tracking
                        // 4. Mark other revisions as superseded
                        // 5. Redirect with success message

                        // 1. First, save the revision data to
                        // post_revisions for auditability
                        // This ensures the revision record
                        // reflects what's being published
                        await postRevisionService.updateRevision(
                            revisionIdInt, dataForDb);

                        // 2. Update the post with revision content
                        // and publish it
                        const postEntity = new PostEntity();
                        postEntity
                            .setId(postIdInt)
                            .setTitle(revisionEntity.getTitle())
                            .setExcerptMarkdown(
                                revisionEntity
                                    .getExcerptMarkdown())
                            .setExcerptHtml(
                                revisionEntity.getExcerptHtml())
                            .setContentMarkdown(
                                revisionEntity
                                    .getContentMarkdown())
                            .setContentHtml(
                                revisionEntity.getContentHtml())
                            .setCategoryId(
                                revisionEntity.getCategoryId())
                            .setMetaDescription(
                                revisionEntity
                                    .getMetaDescription())
                            .setCommentsEnabled(commentsEnabled)
                            .setStatus('published')
                            .setPublishedAt(
                                new Date().toISOString())
                            .setPublishedBy(currentUserId)
                            .setRegenerateStatic(true)
                            .setUpdatedBy(currentUserId);

                        const postDataForDb = postEntity
                            .getDataForDatabase(true);
                        await postService.updatePostById(
                            postIdInt, postDataForDb);

                        // 3. Mark the revision as superseded (now
                        // that it's published)
                        // Update with approved tracking fields
                        await postRevisionService.updateRevision(
                            revisionIdInt, {
                                status: 'superseded',
                                approved_by: currentUserId,
                                approved_at:
                                    new Date().toISOString()
                            });

                        // 4. Mark other revisions as superseded too
                        await postRevisionService
                            .markOtherRevisionsAsSuperseded(
                                postIdInt, revisionIdInt);

                        // 5. Add success message
                        super.plugin('flashMessenger')
                            .addSuccessMessage({
                                title : 'Revision published',
                                message : 'Your changes have been ' +
                                    'published and will appear on ' +
                                    'the live site after the next ' +
                                    'build'
                            });

                        // Redirect to post index since this
                        // revision is now superseded
                        return this.plugin('redirect')
                            .toRoute('adminDashboardEdit',
                                {id : postIdInt});
                    }
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
                        console.log("errorFieldName: " +
                            fieldName);
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
     * Confirmation action
     *
     * Displays confirmation page with flash messages.
     * Shows success, error, warning, or info messages after revision
     * operations.
     *
     * Features:
     * - Displays all flash message types
     * - Redirects to dashboard if no messages exist
     * - Used after successful revision creation or publication
     *
     * Flash Message Types:
     * - Success: Revision published successfully
     * - Error: Validation or database errors
     * - Warning: Draft deleted
     * - Info: Revision draft created/saved
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

module.exports = RevisionController;
