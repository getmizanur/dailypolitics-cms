const Controller = require(global.applicationPath('/library/controller/baseController'));
const LoginForm = require(global.applicationPath('/application/form/loginForm'));
const Container = require(global.applicationPath('/library/session/container'));
const InputFilter = require(
    global.applicationPath('/library/inputfilter/inputFilter'))

class Index extends Controller {

    constructor(options = {}) {
        super(options);
    }

    preDispatch() {
        // IMPORTANT NOTICE:
        // Expose the current controller to the view context so that view helpers
        // (such as onDemandCss) can access routing and request information.
        // This is required for onDemandCss to determine the current module and load
        // the correct CSS file dynamically based on the route.
        //
        // This was done because main.css was too big and had to be split up
        // for better maintainability and understanding. Admin-specific and 
        // bolg-specific CSS is now loaded on demand using onDemandCss.
        //
        // If you wish to remove this line, you must also:
        //   1. Remove {{ onDemandCss(controller) }} from master.njk
        //   2. Deregister 'onDemandCss' from application.config.js under view_helpers
        this.getView().setVariable('controller', this);
    }

    indexAction() {
        const form = new LoginForm();
        form.setAction(
            super.plugin('url').fromRoute('adminIndexIndex'));
        form.setMethod('POST');
        form.addUsernameField();
        form.addPasswordField();
        form.addSubmitButton();
        // Add CSRF field and store token in session
        const csrfToken = form.addCsrfField();

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
                            min : 7,
                            max : 50
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

            }else{
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
                /*if (errorMessages.length > 0) {
                    errorMessages.forEach((message) => {
                        super.plugin('flashMessenger').addErrorMessage(message);
                    });
                }*/
            }
            
        }

        const session = new Container('security');
        session.set('csrfToken', csrfToken);
        
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

            // Set page title
            this.getPluginManager().get('pageTitle').setTitle('Admin');

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

    editArticleAction() {
        return this.getView();
    }

}

module.exports = Index;