const AbstractHelper = require('./abstractHelper');

class FormPassword extends AbstractHelper {

    render(element) {
        if(element == undefined) {
            return;
        }

        var input = '<input ';

        var attributes = element.getAttributes();
        for(var key in attributes) {
            input += key + '="' + attributes[key] + '" '; 
        }

        input += '/>';
        
        return input; 
    }

}

module.exports = FormPassword;
