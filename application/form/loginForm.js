const Form = require(
    global.applicationPath('/library/form/form'));
const Text = require(
    global.applicationPath('/library/form/element/text'));
const Password = require(
    global.applicationPath('/library/form/element/password'));
const Submit = require(
    global.applicationPath('/library/form/element/submit'));


class LoginForm extends Form {
    constructor(options = {}) {
        super(options);
    }

    addUsernameField(name = 'username') {
        const element = new Text(name);
        element.setLabel('Username');
        element.setAttributes({
            'class' : 'nhsuk-input nhsuk-input--width-20',
            'id' : 'username',
            'autocomplete' : 'username'
        });
        this.add(element);
    }

    addPasswordField(name = 'password') {
        const element = new Password(name);
        element.setLabel('Password');
        element.setAttributes({
            'class' : 'nhsuk-input nhsuk-input--width-20',
            'id' : 'password',
            'autocomplete' : 'current-password'
        });
        this.add(element);
    }

    addSubmitButton(name = 'submit') {
        const element = new Submit(name);
        element.setValue('Login');
        element.setAttributes({
            'class' : 'nhsuk-button'
        });
        this.add(element);
    }
}

module.exports = LoginForm;