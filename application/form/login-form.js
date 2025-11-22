const Form = require(
    global.applicationPath('/library/form/form'));
const Text = require(
    global.applicationPath('/library/form/element/text'));
const Password = require(
    global.applicationPath('/library/form/element/password'));

const Submit = require(
    global.applicationPath('/library/form/element/submit'));
const Csrf = require(
    global.applicationPath('/library/form/element/csrf'));


class LoginForm extends Form {
    constructor(options = {}) {
        super(options);
    }

    addUsernameField(name = 'username') {
        const element = new Text(name);
        element.setLabel('Username');
        element.setAttributes({
            'class' : 'dp-input',
            'id' : 'username'
        });
        element.setLabelAttribute('class', 'dp-label');
        this.add(element);
    }

    addPasswordField(name = 'password') {
        const element = new Password(name);
        element.setLabel('Password');
        element.setAttributes({
            'class' : 'dp-input',
            'id' : 'password'
        });
        element.setLabelAttribute('class', 'dp-label');
        this.add(element);
    }

    addSubmitButton(name = 'submit') {
        const element = new Submit(name);
        element.setValue('Login');
        element.setAttributes({
            'class' : 'dp-button'
        });
        this.add(element);
    }

    addCsrfField(name = 'csrf', options = {}) {
        const element = new Csrf(name, options);
        this.add(element);
        // Optionally, return the token for session storage
        return element.getToken();
    }
}

module.exports = LoginForm;