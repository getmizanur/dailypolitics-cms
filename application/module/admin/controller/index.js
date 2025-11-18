const Controller = require(global.applicationPath('/library/controller/baseController'));
const LoginForm = require(global.applicationPath('/application/form/loginForm'));
const Container = require(global.applicationPath('/library/session/container'));
const InputFilter = require(
    global.applicationPath('/library/inputfilter/inputFilter'))

class Index extends Controller {

    constructor(options = {}) {
        super(options);
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

}

module.exports = Index;