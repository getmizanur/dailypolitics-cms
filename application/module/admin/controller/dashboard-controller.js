const Controller = require(global.applicationPath('/library/mvc/controller/base-controller'));
const ArticleForm = require(global.applicationPath('/application/form/article-form'));
const SessionContainer = require(global.applicationPath('/library/session/session-container'));
const InputFilter = require(global.applicationPath('/library/input-filter/input-filter'));
const fs = require('fs');

class DashboardController extends Controller {

    constructor(options = {}) {
        super(options);
    }

    preDispatch() {
        // Check authentication
        const authService = this.getServiceManager().get('AuthenticationService');
        if (!authService.hasIdentity()) {
            super.plugin('flashMessenger').addErrorMessage('You must be logged in to access this page');
            return this.plugin('redirect').toRoute('adminLoginIndex');
        }
        this.getServiceManager().get('ViewHelperManager').get('headTitle').append('Admin');
    }

    async indexAction() {
        return this.listAction();
    }

    async listAction() {
        try {
            const postService = this.getServiceManager().get('PostService');
            const page = parseInt(this.getParam('page')) || 1;
            const limit = 5;
            const offset = (page - 1) * limit;

            // Fetch posts with all statuses and total count for pagination
            const [posts, totalCount] = await Promise.all([
                postService.getAllPostsWithStatus(['draft', 'published', 'archived'], limit, offset),
                postService.getPostCount()
            ]);

            // Get recent posts for sidebar
            const recentPosts = await postService.getRecentPostsForSidebar();

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

            // Set view variables
            this.getView()
                .setVariable('posts', posts)
                .setVariable('pagination', {
                    mode: 'admin',
                    currentPage: page,
                    totalItems: totalCount,
                    baseUrl: '/admin/dashboard'
                });

            return this.getView();

        } catch (error) {
            console.error('Error in indexAction:', error);
            throw error;
        }
    }

    async editAction() {
        const logFile = global.applicationPath('/logs/debug.log');
        const log = (msg) => {
            const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
            console.log(msg);
            fs.appendFileSync(logFile, logMsg);
        };

        try {
            log('=== editAction started ===');

            const postService = this.getServiceManager().get('PostService');
            log('PostService retrieved');

            // Fetch all categories from database
            const categories = await postService.getAllCategories();
            log(`Categories fetched: ${categories.length} categories`);

            // Create form
            const form = new ArticleForm();
            log('ArticleForm created');

            // Set form attributes
            form.setAction('/admin/dashboard/edit');
            form.setMethod('POST');
            log('Form attributes set');

            // Initialize form with categories
            const session = new SessionContainer('security');
            form.init(categories, { session: session });
            log('Form initialized with categories');

            // If editing existing article, fetch and populate data
            const articleSlug = this.getParam('slug');
            if (articleSlug) {
                log(`Fetching article with slug: ${articleSlug}`);
                const article = await postService.getSinglePost(articleSlug, true);
                if (article) {
                    log('Article found, populating form');
                    form.setData({
                        id: article.id,
                        slug: article.slug,
                        title: article.title,
                        excerpt: article.excerpt,
                        content: article.content,
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
                'id': {
                    required: true,
                    filters: [
                        { name: 'HtmlEntities' },
                        { name: 'StringTrim' },
                        { name: 'StripTags' }
                    ]
                },
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
                    requiredMessage: "Please enter title",
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
                'excerpt': {
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
                                    INVALID_TOO_LONG: 'Excerpt must not exceed 150 characters'
                                }
                            }
                        }
                    ]
                },
                'content': {
                    required: true,
                    requiredMessage: "Please enter content",
                    filters: [
                        { name: 'HtmlEntities' },
                        { name: 'StringTrim' },
                        { name: 'StripTags' }
                    ]
                },
                'author_name': {
                    required: false,
                    filters: [
                        { name: 'HtmlEntities' },
                        { name: 'StringTrim' },
                        { name: 'StripTags' }
                    ]
                },
                'category_id': {
                    required: true,
                    requiredMessage: "Please select a category",
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
                                    INVALID_TOO_LONG: 'Meta description must not exceed 150 characters'
                                }
                            }
                        }
                    ]
                },
                'comment_enabled': {
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
                },
                'csrf': {
                    required: true,
                    filters: [
                        { name: 'HtmlEntities' },
                        { name: 'StringTrim' },
                        { name: 'StripTags' }
                    ],
                    validators: [
                        {
                            name: 'StringLength',
                            options: {
                                min: 64,
                                max: 64,
                                messageTemplate: {
                                    INVALID_TOO_SHORT: 'Invalid CSRF token',
                                    INVALID_TOO_LONG: 'Invalid CSRF token'
                                }
                            }
                        },
                        {
                            name: 'AlphaNumeric',
                            options: {
                                messageTemplate: {
                                    INVALID_FORMAT: 'CSRF token must contain only alphanumeric characters'
                                }
                            }
                        }
                    ]
                }
            });
            form.setInputFilter(inputFilter);

            if (super.getRequest().isPost()) {
                const postData = super.getRequest().getPost();
                log(`Post data received: ${JSON.stringify(postData)}`);
                form.setData(postData);

                const isFormValid = form.isValid();
                log(`Form validation result: ${isFormValid}`);

                if (isFormValid) {
                    log('Form is valid - no errors');
                } else {
                    // After form.isValid() returns false
                    // Get validation messages from form
                    const formMessages = form.getMessages();
                    log(`Validation messages: ${JSON.stringify(formMessages)}`);

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

            log('Returning view with form');
            return this.getView()
                .setVariable('f', form);

        } catch (error) {
            const errorMsg = `Error in editAction: ${error.message}\nStack: ${error.stack}`;
            log(errorMsg);
            fs.appendFileSync(logFile, errorMsg + '\n');
            throw error;
        }
    }
}

module.exports = DashboardController;
