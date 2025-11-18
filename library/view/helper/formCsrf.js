const AbstractHelper = require('./abstractHelper');

class FormCsrf extends AbstractHelper {
    /**
     * Render CSRF hidden input field
     * @param {Element} element - Csrf element instance
     * @returns {string} HTML for hidden CSRF input
     */
    render(element) {
        if (!element) return '';
        let input = '<input ';
        const attributes = element.getAttributes();
        for (const key in attributes) {
            input += key + '="' + attributes[key] + '" ';
        }
        input += '/>';
        return input;
    }
}

module.exports = FormCsrf;