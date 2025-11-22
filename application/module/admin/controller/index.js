const Controller = require(global.applicationPath('/library/controller/baseController'));
const LoginForm = require(global.applicationPath('/application/form/loginForm'));
const ArticleForm = require(global.applicationPath('/application/form/articleForm'));
const Container = require(global.applicationPath('/library/session/container'));
const InputFilter = require(
    global.applicationPath('/library/inputfilter/inputFilter'));
const DbAdapter = require(global.applicationPath('/library/authentication/adapter/dbAdapter'));
const fs = require('fs');

class Index extends Controller {

    constructor(options = {}) {
        super(options);
    }

    preDispatch() {
        // Check authentication for all actions except login
        const actionName = this.getRequest().getActionName();

        if (actionName !== 'indexAction') {
            const authService = this.getServiceManager().get('AuthenticationService');

            if (!authService.hasIdentity()) {
                super.plugin('flashMessenger').addErrorMessage('You must be logged in to access this page');
                return this.plugin('redirect').toRoute('adminIndexIndex');
            }
        }

        // Access headTitle helper through the view
        //const viewModel = this.getView();
        //const headTitle = viewModel.getHelper('headTitle');
        //headTitle.append('Admin');
        this.getServiceManager().get('ViewHelperManager').get('headTitle').append('Admin');
    }

    async indexAction() {
        // Initialize authentication service
        const authService = this.getServiceManager().get('AuthenticationService');

        // Initialize security session container for CSRF token management
        // Pass the express-session object directly to the Container
        const expressSession = this.getSession();
        const securitySession = new Container('security', expressSession);

        console.log('Session ID:', expressSession ? expressSession.id : 'NO SESSION');
        console.log('Session customData:', expressSession ? JSON.stringify(expressSession.customData) : 'NO SESSION');

        // Check if user is already authenticated - redirect to dashboard
        if (authService.hasIdentity()) {
            return this.plugin('redirect').toRoute('adminIndexDashboard');
        }

        const form = new LoginForm();
        form.setAction(
            super.plugin('url').fromRoute('adminIndexIndex'));
        form.setMethod('POST');
        form.addUsernameField();
        form.addPasswordField();
        form.addSubmitButton();

        // Get or generate CSRF token
        let csrfToken = securitySession.get('csrfToken');
        if (!csrfToken) {
            // Only generate new token if one doesn't exist
            csrfToken = form.addCsrfField();
            securitySession.set('csrfToken', csrfToken);
        } else {
            // Use existing token from session
            form.addCsrfField('csrf', { token: csrfToken });
        }

        const inputFilter = InputFilter.factory({
            'username': {
                required : true,
                requiredMessage : "Please enter username",
                filters : [
                    { name : 'HtmlEntities' },
                    { name : 'StringTrim' },
                    { name : 'StripTags' }
                ],
                validators : [
                    {
                        name : 'EmailAddress',
                        messages : {
                            INVALID : `Invalid type given. String expected`,
                            INVALID_FORMAT : `The username is not a valid email address`
                        }
                    }
                ]
            },
            'password': {
                required : true,
                requiredMessage : "Please enter password",
                filters : [
                    { name : 'HtmlEntities' },
                    { name : 'StringTrim' },
                    { name : 'StripTags' }
                ],
                validators : [
                    {
                        name : 'StringLength',
                        options : {
                            name : "password",
                            max : 50
                        }
                    }
                ]
            },
            'csrf': {
                required : true,
                filters : [
                    { name : 'HtmlEntities' },
                    { name : 'StringTrim' },
                    { name : 'StripTags' }
                ],
                validators : [
                    {
                        name : 'StringLength',
                        options : {
                            min : 64,
                            max : 64,
                            messageTemplate : {
                                INVALID_TOO_SHORT : 'Invalid CSRF token',
                                INVALID_TOO_LONG : 'Invalid CSRF token'
                            }
                        }
                    },
                    {
                        name : 'AlphaNumeric',
                        options : {
                            messageTemplate : {
                                INVALID_FORMAT : 'CSRF token must contain only alphanumeric characters'
                            }
                        }
                    }
                ]
            }
        });
        form.setInputFilter(inputFilter);

        if(super.getRequest().isPost()) {
            const postData = super.getRequest().getPost();
            form.setData(postData);

            if(form.isValid()) {
                // Get filtered values
                const values = form.getData();

                // Verify CSRF token
                const storedCsrfToken = securitySession.get('csrfToken');

                console.log('CSRF Check:');
                console.log('  Submitted CSRF:', values.csrf);
                console.log('  Stored CSRF:', storedCsrfToken);
                console.log('  Match:', values.csrf === storedCsrfToken);

                if (values.csrf !== storedCsrfToken) {
                    console.log('CSRF token mismatch! Regenerating new token...');
                    // Clear the old token and regenerate on next page load
                    securitySession.remove('csrfToken');
                    super.plugin('flashMessenger').addErrorMessage('Invalid CSRF token. Please try again.');
                } else {
                    console.log('CSRF token valid, proceeding with authentication');
                    // Perform authentication
                    try {
                        console.log('Starting authentication...');
                        const db = this.getServiceManager().get('Database');
                        console.log('Database adapter retrieved:', db.constructor.name);

                        // Connect to database if not already connected
                        if (!db.connection) {
                            console.log('Connecting to database...');
                            await db.connect();
                            console.log('Database connected successfully');
                        }

                        const adapter = new DbAdapter(db, 'users', 'email', 'password_hash', 'password_salt');
                        adapter.setUsername(values.username);
                        adapter.setPassword(values.password);

                        console.log('Attempting authentication for user:', values.username);

                        authService.setAdapter(adapter);
                        const result = await authService.authenticate();

                        console.log('Authentication result:', result.getCode(), result.getMessages());

                        if (result.isValid()) {
                            // Authentication successful
                            console.log('Authentication successful');

                            // Write identity to session (without regeneration for now)
                            const identity = result.getIdentity();
                            const authStorage = authService.getStorage();
                            authStorage.write(identity);
                            console.log('Identity written to session');
                            console.log('Session customData after write:', JSON.stringify(expressSession.customData));

                            // Explicitly save session before redirect
                            await securitySession.save();
                            console.log('Session saved successfully');

                            super.plugin('flashMessenger').addSuccessMessage('Login successful');
                            const redirectResponse = this.plugin('redirect').toRoute('adminIndexDashboard');
                            console.log('Redirect response created:', redirectResponse ? 'YES' : 'NO');
                            console.log('Redirect URL:', redirectResponse ? redirectResponse.getHeader('Location') : 'NONE');
                            console.log('Is redirect?:', redirectResponse ? redirectResponse.isRedirect() : 'NONE');
                            return redirectResponse;
                        } else {
                            // Authentication failed - show generic error
                            console.log('Authentication failed');
                            super.plugin('flashMessenger').addErrorMessage('Authentication unsuccessful');
                        }
                    } catch (error) {
                        console.error('Authentication error:', error);
                        super.plugin('flashMessenger').addErrorMessage('An error occurred during authentication: ' + error.message);
                    }
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

                // Add validation error messages to flash messenger
                if (errorMessages.length > 0) {
                    errorMessages.forEach((message) => {
                        super.plugin('flashMessenger').addErrorMessage(message);
                    });
                }
            }

        }

        // Pass form and token to the view (adjust as needed for your view system)
        return this.getView()
            .setVariable('f', form);
    }

    async dashboardAction() {
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
                    mode : 'admin',
                    currentPage: page,
                    totalItems: totalCount,
                    baseUrl: '/admin/dashboard'
                });

            return this.getView();

        } catch (error) {
            console.error('Error in dashboardAction:', error);
            throw error;
        }
    }

    async editArticleAction() {
        const logFile = global.applicationPath('/logs/debug.log');
        const log = (msg) => {
            const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
            console.log(msg);
            fs.appendFileSync(logFile, logMsg);
        };

        try {
            log('=== editArticleAction started ===');

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
            const session = new Container('security');
            form.init(categories, { session: session });
            log('Form initialized with categories');

            // If editing existing article, fetch and populate data
            const articleId = this.getParam('id');
            if (articleId) {
                log(`Fetching article with ID: ${articleId}`);
                const article = await postService.getSinglePost(articleId, false);
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
                'id' : {
                    required : true,
                    filters : [
                        { name : 'HtmlEntities' },
                        { name : 'StringTrim' },
                        { name : 'StripTags' }
                    ]
                },
                'author_id' : {
                    required : true,
                    filters : [
                        { name : 'HtmlEntities' },
                        { name : 'StringTrim' },
                        { name : 'StripTags' }
                    ]
                },
                'title': {
                    required : true,
                    requiredMessage : "Please enter title",
                    filters : [
                        { name : 'HtmlEntities' },
                        { name : 'StringTrim' },
                        { name : 'StripTags' }
                    ],
                    validators : [
                        {
                            name : 'StringLength',
                            options : {
                                name : "title",
                                min : 20,
                                max : 150,
                                messageTemplate : {
                                    INVALID_TOO_SHORT : 'Title must be at least 20 characters long',
                                    INVALID_TOO_LONG : 'Title must not exceed 150 characters'
                                }
                            }
                        }
                    ]
                },
                'slug': {
                    required : true,
                    requiredMessage: "Required, non-empty field",
                    filters : [
                        { name : 'HtmlEntities' },
                        { name : 'StringTrim' },
                        { name : 'StripTags' }
                    ],
                    validators : [
                        {
                            name : 'AlphaNumeric',
                            options : {
                                name : 'slug',
                                allowDashAndUnderscore : true,
                                messageTemplate : {
                                    INVALID_FORMAT : 'Slug must contain only alphanumeric characters, hyphens, and underscores'
                                }
                            }
                        }
                    ]
                },
                'excerpt': {
                    required : false,
                    filters : [
                        { name : 'HtmlEntities' },
                        { name : 'StringTrim' },
                        { name : 'StripTags' }
                    ],
                    validators : [
                        {
                            name : 'StringLength',
                            options : {
                                name : "excerpt",
                                max : 150,
                                messageTemplate : {
                                    INVALID_TOO_LONG : 'Excerpt must not exceed 150 characters'
                                }
                            }
                        }
                    ]
                },
                'content': {
                    required : true,
                    requiredMessage : "Please enter content",
                    filters : [
                        { name : 'HtmlEntities' },
                        { name : 'StringTrim' },
                        { name : 'StripTags' }
                    ]
                },
                'author_name': {
                    required : false,
                    filters : [
                        { name : 'HtmlEntities' },
                        { name : 'StringTrim' },
                        { name : 'StripTags' }
                    ]
                },
                'category_id': {
                    required : true,
                    requiredMessage : "Please select a category",
                    filters : [
                        { name : 'HtmlEntities' },
                        { name : 'StringTrim' },
                        { name : 'StripTags' }
                    ],
                    validators : [
                        {
                            name : 'InArray',
                            options : {
                                haystack : categoryIds
                            },
                            messages : {
                                NOT_IN_ARRAY : 'Please select a valid category'
                            }
                        }
                    ]
                },
                'meta_description': {
                    required : false,
                    filters : [
                        { name : 'HtmlEntities' },
                        { name : 'StringTrim' },
                        { name : 'StripTags' }
                    ],
                    validators : [
                        {
                            name : 'StringLength',
                            options : {
                                name : "meta_description",
                                max : 150,
                                messageTemplate : {
                                    INVALID_TOO_LONG : 'Meta description must not exceed 150 characters'
                                }
                            }
                        }
                    ]
                },
                'comment_enabled': {
                    required : false,
                    filters : [
                        { name : 'HtmlEntities' },
                        { name : 'StringTrim' },
                        { name : 'StripTags' }
                    ],
                    validators : [
                        {
                            name : 'Callback',
                            options : {
                                callback : (value) => {
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
                                messageTemplate : {
                                    INVALID : 'Invalid value for comment enabled'
                                }
                            }
                        }
                    ]
                },
                'csrf': {
                    required : true,
                    filters : [
                        { name : 'HtmlEntities' },
                        { name : 'StringTrim' },
                        { name : 'StripTags' }
                    ],
                    validators : [
                        {
                            name : 'StringLength',
                            options : {
                                min : 64,
                                max : 64,
                                messageTemplate : {
                                    INVALID_TOO_SHORT : 'Invalid CSRF token',
                                    INVALID_TOO_LONG : 'Invalid CSRF token'
                                }
                            }
                        },
                        {
                            name : 'AlphaNumeric',
                            options : {
                                messageTemplate : {
                                    INVALID_FORMAT : 'CSRF token must contain only alphanumeric characters'
                                }
                            }
                        }
                    ]
                }
            });
            form.setInputFilter(inputFilter);
            
            if(super.getRequest().isPost()) {
                const postData = super.getRequest().getPost();
                log(`Post data received: ${JSON.stringify(postData)}`);
                form.setData(postData);

                const isFormValid = form.isValid();
                log(`Form validation result: ${isFormValid}`);

                if(isFormValid) {
                    log('Form is valid - no errors');
                }else{
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
            }

            log('Returning view with form');
            return this.getView()
                .setVariable('f', form);

        } catch (error) {
            const errorMsg = `Error in editArticleAction: ${error.message}\nStack: ${error.stack}`;
            log(errorMsg);
            fs.appendFileSync(logFile, errorMsg + '\n');
            throw error;
        }
    }

    async logoutAction() {
        // Initialize authentication service
        const authService = this.getServiceManager().get('AuthenticationService');

        // Clear identity
        authService.clearIdentity();

        // Add success message
        super.plugin('flashMessenger').addSuccessMessage('You have been logged out successfully');

        // Explicitly save session before redirect
        const expressSession = this.getSession();
        const securitySession = new Container('security', expressSession);
        await securitySession.save();
        console.log('Session saved after logout');

        // Redirect to login page
        return this.plugin('redirect').toRoute('adminIndexIndex');
    }
}

module.exports = Index;