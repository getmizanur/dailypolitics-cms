const AbstractHelper = require(global.applicationPath('/library/mvc/view/helper/abstract-helper'));

/**
 * TruncateHelper - Truncates text to a specified word count with ellipsis
 * Usage in template: {{ truncate(text, 100) }}
 */
class TruncateHelper extends AbstractHelper {

    /**
     * Truncate text to specified word count
     * @param {string} text - Text to truncate
     * @param {number} wordLimit - Maximum number of words (default: 100)
     * @param {string} ellipsis - Ellipsis string to append (default: '...')
     * @returns {string} - Truncated text with ellipsis if needed
     */
    render(...args) {
        // Extract Nunjucks context from arguments
        const cleanArgs = this._extractContext(args);
        const [text, wordLimit = 100, ellipsis = '...'] = cleanArgs;

        // Handle null, undefined, or non-string inputs
        if (!text || typeof text !== 'string') {
            return '';
        }

        // Strip HTML tags from text
        const strippedText = text.replace(/<[^>]*>/g, '');

        // Split text into words (by whitespace)
        const words = strippedText.trim().split(/\s+/);

        // If word count is within limit, return original text
        if (words.length <= wordLimit) {
            return strippedText;
        }

        // Truncate to word limit and add ellipsis
        const truncated = words.slice(0, wordLimit).join(' ');
        return truncated + ellipsis;
    }

}

module.exports = TruncateHelper;
