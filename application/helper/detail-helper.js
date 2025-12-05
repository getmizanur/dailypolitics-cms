const AbstractHelper = require(global.applicationPath('/library/mvc/view/helper/abstract-helper'));
const StringUtil = require('../../library/util/string-util');

/**
 * DetailHelper - Renders a collapsible details element with help text
 * Usage in template: {{ detail(element, message) | safe }}
 *
 * @example
 * {{ detail(form.get('title'), 'Enter a descriptive title for your post.') | safe }}
 */
class DetailHelper extends AbstractHelper {

    /**
     * Render details element with help text
     * @param {Object} element - Form element with label
     * @param {string} message - Help message to display
     * @returns {string} - HTML markup for details element
     */
    render(...args) {
        // Extract Nunjucks context from arguments
        const cleanArgs = this._extractContext(args);
        const [element, message] = cleanArgs;

        // Validate inputs
        if (!element) {
            console.warn('[DetailHelper] No element provided');
            return '';
        }

        if (!message || typeof message !== 'string') {
            console.warn('[DetailHelper] No message provided');
            return '';
        }

        // Get field label from element
        let fieldLabel = 'this field';
        if (element && element.getLabel) {
            fieldLabel = element.getLabel() || fieldLabel;
        } else if (element && element.label) {
            fieldLabel = element.label || fieldLabel;
        }

        fieldLabel = StringUtil.strtolower(fieldLabel);

        // Escape HTML in message to prevent XSS
        const escapedMessage = this._escapeHtml(message);

        // Generate unique ID for accessibility
        const uniqueId = `detail-${Math.random().toString(36).substr(2, 9)}`;

        // Return HTML with inline styles (GOV.UK Design System style)
        return `
<!-- Detail Helper (GOV.UK Design System style) -->
<details class="govuk-details" id="${uniqueId}">
  <summary class="govuk-details__summary">
    <span class="govuk-details__summary-text">
      Help with ${fieldLabel}
    </span>
  </summary>
  <div class="govuk-details__text">
    ${escapedMessage}
  </div>
</details>

<style>
  /* GOV.UK Details Component Styles */
  .govuk-details {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
    font-size: 16px;
    line-height: 1.25;
    color: #0b0c0c;
    margin-bottom: 20px;
  }

  .govuk-details__summary {
    display: inline-block;
    position: relative;
    margin-bottom: 5px;
    padding-left: 25px;
    color: #1d70b8;
    cursor: pointer;
  }

  .govuk-details__summary:hover {
    color: #003078;
  }

  .govuk-details__summary:focus {
    outline: 3px solid #ffdd00;
    outline-offset: 0;
    background-color: #ffdd00;
    box-shadow: 0 -2px #ffdd00, 0 4px #0b0c0c;
    text-decoration: none;
  }

  /* Remove default marker */
  .govuk-details__summary::-webkit-details-marker {
    display: none;
  }

  .govuk-details__summary-text {
    text-decoration: underline;
    text-decoration-thickness: max(1px, .0625rem);
    text-underline-offset: .1em;
  }

  /* Arrow/Triangle icon */
  .govuk-details__summary::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    display: block;
    width: 0;
    height: 0;
    border-style: solid;
    border-color: transparent;
    clip-path: polygon(0% 0%, 100% 50%, 0% 100%);
    border-width: 7px 0 7px 12.124px;
    border-left-color: inherit;
    transition: transform 0.1s ease-in-out;
  }

  /* Rotate arrow when open */
  .govuk-details[open] > .govuk-details__summary::before {
    transform: rotate(90deg);
  }

  .govuk-details__text {
    padding: 15px;
    padding-left: 20px;
    border-left: 5px solid #b1b4b6;
    margin-top: 10px;
  }

  .govuk-details__text p {
    margin-top: 0;
    margin-bottom: 20px;
  }

  .govuk-details__text p:last-child {
    margin-bottom: 0;
  }
</style>
`;
    }

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} - Escaped text
     * @private
     */
    _escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    }

}

module.exports = DetailHelper;
