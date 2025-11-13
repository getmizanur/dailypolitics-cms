const Element = require('../../form/element');
const AbstractHelper = require('./abstractHelper');

class FormError extends AbstractHelper {

    render(element, attributes = {}) {
        if(!element instanceof Element) {
            throw new Error("Value is not an instance of Element");
        }

        let messages = element.getMessages();
        if(messages.length == 0) {
            return '';
        }

        let markup = this.messageOpenFormat(attributes);
        for(let key in messages) {
            markup += '<li>' + messages[key] + '</li>';
        }
        markup += this.messageCloseString();

        return markup;
    }

    messageOpenFormat(attributes) {
        let markup = '<ul';
        for(let key in attributes) {
            markup += ' ' + key + '="' + attributes[key] + '" ';
        }
        markup += '>';

        return markup;
    }

    messageCloseString() {
        let markup = '</ul>';

        return markup;
    }

    messageSeparatorString() {
        let markup = '</li><li>';

        return markup;
    }

}

module.exports = FormError;
