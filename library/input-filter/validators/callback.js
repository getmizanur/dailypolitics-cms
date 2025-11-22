const AbstractValidator = require('./abstract-validator');

class Callback extends AbstractValidator {

    constructor(options = {}) {
        super();
        this.callback = options.callback;
        this.message = null;
        this.messageTemplate = options.messageTemplate || {
            INVALID: 'The input value is invalid'
        };
    }

    isValid(value) {
        const result = this.callback(value);
        if (!result) {
            this.message = this.messageTemplate.INVALID;
        }
        return result;
    }

    setMessage(message, key) {
        if (key && this.messageTemplate.hasOwnProperty(key)) {
            this.messageTemplate[key] = message;
        }
    }

    getClass() {
        return this.constructor.name;
    }

}

module.exports = Callback
