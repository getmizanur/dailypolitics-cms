const AbstractHelper = require(global.applicationPath('/library/mvc/view/helper/abstract-helper'));

/**
 * ExplodeHelper - Splits a string by a string
 * Mimics PHP's explode function
 * Usage in template: {{ explode(',', 'one,two,three') }}
 */
class ExplodeHelper extends AbstractHelper {

    /**
     * Split a string by a string
     * @param {string} separator - The boundary string
     * @param {string} string - The input string
     * @param {number} limit - Optional limit
     * @returns {Array} - Array of strings
     */
    render(...args) {
        // Extract Nunjucks context from arguments
        const cleanArgs = this._extractContext(args);
        const [separator, string, limit] = cleanArgs;

        if (string === undefined || string === null) {
            return [];
        }

        // Ensure string is actually a string
        const inputString = String(string);

        // If separator is empty string, return false (like PHP) or handle gracefully
        // PHP explode throws ValueError if separator is empty string.
        // JS split('') splits by character.
        // Let's mimic PHP behavior reasonably but safely.
        if (separator === '') {
            return false;
        }

        let result = inputString.split(separator);

        if (typeof limit !== 'undefined') {
            const limitInt = parseInt(limit);
            if (!isNaN(limitInt)) {
                if (limitInt > 0) {
                    if (limitInt < result.length) {
                        const remaining = result.slice(limitInt - 1).join(separator);
                        result = result.slice(0, limitInt - 1);
                        result.push(remaining);
                    }
                } else if (limitInt < 0) {
                    result = result.slice(0, limitInt);
                }
            }
        }

        return result;
    }

}

module.exports = ExplodeHelper;
