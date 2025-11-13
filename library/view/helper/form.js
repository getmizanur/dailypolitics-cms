const AbstractHelper = require('./abstractHelper');

class Form extends AbstractHelper {

    render() {
        return this;
    }

    openTag(form) {
        var tag = '<form ';

        var attribs = form.getAttribs();
        for(var key in attribs) {
            tag += key + '="' + attribs[key] + '" ';
        }
        tag += '>';

        return tag;
    }

    closeTag() {
        return '</form>';
    }

}

module.exports = Form;
