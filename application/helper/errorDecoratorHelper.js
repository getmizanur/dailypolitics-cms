class ErrorDecoratorHelper {
    /**
     * Returns the error class if the element has error messages
     * @param {Element} element - The form element instance
     * @param {string} errorClass - The class to return if error exists (default: 'dp-input--error')
     * @returns {string}
     */
    render(element, errorClass = 'dp-input--error') {
        if (!element || typeof element.getMessages !== 'function') {
            return '';
        }
        const messages = element.getMessages();
        if (Array.isArray(messages) && messages.length > 0) {
            return errorClass;
        }
        return '';
    }
}

module.exports = ErrorDecoratorHelper;
