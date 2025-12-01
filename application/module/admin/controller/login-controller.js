const Controller = require(global.applicationPath('/library/mvc/controller/base-controller'));
const LoginForm = require(global.applicationPath('/application/form/login-form'));
const InputFilter = require(
    global.applicationPath('/library/input-filter/input-filter'));
const DbAdapter = require(global.applicationPath('/library/authentication/adapter/db-adapter'));

class LoginController extends Controller {

    constructor(options = {}) {
        super(options);
    }

    preDispatch() {
        // Check authentication for all actions except login and index
        const actionName = this.getRequest().getActionName();

        if (actionName !== 'indexAction' && actionName !== 'loginAction') {
            const authService = this.getServiceManager().get('AuthenticationService');

            if (!authService.hasIdentity()) {
                super.plugin('flashMessenger').addErrorMessage('You must be logged in to access this page');
                return this.plugin('redirect').toRoute('adminLoginIndex');
            }
        }

        //Access headTitle helper through the view
        //const viewModel = this.getView();
        //const headTitle = viewModel.getHelper('headTitle');
        //headTitle.append('Admin');
        this.getServiceManager().get('ViewHelperManager').get('headTitle').append('Admin');
    }

    async indexAction() {
        return await this.loginAction();
    }

    async loginAction() {
        // Initialize authentication service
        const authService = this.getServiceManager().get('AuthenticationService');

        // Get express session
        const expressSession = this.getSession();

        console.log('Session ID:', expressSession ? expressSession.id : 'NO SESSION');
        console.log('Session.AuthIdentity:', expressSession ? JSON.stringify(expressSession.AuthIdentity) : 'NO SESSION');

        // Check if user is already authenticated - redirect to dashboard
        if (authService.hasIdentity()) {
            return this.plugin('redirect').toRoute('adminDashboardIndex');
        }

        const form = new LoginForm();
        form.setAction(
            super.plugin('url').fromRoute('adminLoginIndex'));
        form.setMethod('POST');
        form.addUsernameField();
        form.addPasswordField();
        form.addSubmitButton();

        const inputFilter = InputFilter.factory({
            'username': {
                required: true,
                requiredMessage: "Please enter username",
                filters: [
                    { name: 'HtmlEntities' },
                    { name: 'StringTrim' },
                    { name: 'StripTags' }
                ],
                validators: [
                    {
                        name: 'EmailAddress',
                        messages: {
                            INVALID: `Invalid type given. String expected`,
                            INVALID_FORMAT: `The username is not a valid email address`
                        }
                    }
                ]
            },
            'password': {
                required: true,
                requiredMessage: "Please enter password",
                filters: [
                    { name: 'HtmlEntities' },
                    { name: 'StringTrim' },
                    { name: 'StripTags' }
                ],
                validators: [
                    {
                        name: 'StringLength',
                        options: {
                            name: "password",
                            max: 50
                        }
                    }
                ]
            }
        });
        form.setInputFilter(inputFilter);

        if (super.getRequest().isPost()) {

            const postData = super.getRequest().getPost();
            form.setData(postData);

            if (form.isValid()) {
                try {
                    const values = form.getData();
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
                        console.log('Session.AuthIdentity after write:', JSON.stringify(expressSession.AuthIdentity));

                        // Explicitly save session before redirect
                        // IMPORTANT: Must await to ensure session is persisted before redirect
                        await new Promise((resolve, reject) => {
                            expressSession.save((err) => {
                                if (err) {
                                    console.error('[Login] Session save error:', err);
                                    reject(err);
                                } else {
                                    console.log('[Login] Session saved successfully');
                                    resolve();
                                }
                            });
                        });

                        super.plugin('flashMessenger').addSuccessMessage('Login successful');
                        const redirectResponse = this.plugin('redirect').toRoute('adminDashboardIndex');
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
            .setVariable('loginForm', form);
    }

    async logoutAction() {
        console.log('==========================================');
        console.log('[LogoutAction] START - User attempting to logout');
        console.log('==========================================');

        const expressRequest = this.getRequest().getExpressRequest();
        const oldSessionId = expressRequest.session.id;
        console.log('[LogoutAction] Current session ID:', oldSessionId);

        // Destroy the session completely
        await new Promise((resolve, reject) => {
            expressRequest.session.destroy((err) => {
                if (err) {
                    console.error('[LogoutAction] Session destroy error:', err);
                    reject(err);
                } else {
                    console.log('[LogoutAction] Session destroyed successfully, ID was:', oldSessionId);
                    resolve();
                }
            });
        });

        console.log('[LogoutAction] Redirecting to login page...');
        console.log('==========================================');
        console.log('[LogoutAction] END');
        console.log('==========================================');

        // Redirect to login page
        return this.plugin('redirect').toRoute('adminLoginIndex');
    }
}

module.exports = LoginController;