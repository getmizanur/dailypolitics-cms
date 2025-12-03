const AbstractHelper = require(
    global.applicationPath('/library/mvc/view/helper/abstract-helper'));

/**
 * FlashPanelHelper - Renders confirmation panels for completed actions
 * Displays prominent panels to notify users that an action is complete
 * Supports completion, information, and warning panel types
 * Usage in templates:
 *   {{ flashPanel('completion', 'Application complete',
 *      'Your reference number<br><strong>HDJ2123F</strong>') | safe }}
 *   {{ flashPanel('information', 'Title', 'Body content') | safe }}
 *   {{ flashPanel('warning', 'Title', 'Body content') | safe }}
 *
 * Panel Types:
 * - completion: Green panel for successful completion
 *               (dp-panel--confirmation)
 * - information: Blue panel for informational messages
 *                (dp-panel--information) - Reserved for future use
 * - warning: Yellow panel for warnings (dp-panel--warning) -
 *            Reserved for future use
 * @extends AbstractHelper
 */
class FlashPanelHelper extends AbstractHelper {

    /**
     * Constructor
     * Initializes the flash panel helper
     */
    constructor() {
        super();
    }

    /**
     * Render flash panel
     * Creates a prominent panel to display completion or status messages
     * @param {string} type - Panel type: 'completion', 'information',
     *                        or 'warning'
     * @param {string} title - Panel title (displayed as h1)
     * @param {string} body - Panel body content (can include HTML)
     * @param {Object} options - Optional configuration
     * @param {boolean} options.escapeHtml - Whether to escape HTML in
     *                                       body (default: false)
     * @returns {string} HTML string for the panel
     */
    render(...args) {
        // Extract Nunjucks context from arguments
        const cleanArgs = this._extractContext(args);
        const [
            type = 'completion',
            title = '',
            body = '',
            options = {}
        ] = cleanArgs;

        // Return empty string if no title or body
        if (!title && !body) {
            return '';
        }

        // Default options
        const config = {
            escapeHtml: false,
            ...options
        };

        // Render based on type
        switch (type) {
            case 'completion':
                return this._renderCompletionPanel(
                    title, body, config);
            case 'information':
                return this._renderInformationPanel(
                    title, body, config);
            case 'warning':
                return this._renderWarningPanel(title, body, config);
            default:
                console.warn(
                    `Unknown flash panel type: ${type}. ` +
                    `Using 'completion'.`);
                return this._renderCompletionPanel(
                    title, body, config);
        }
    }

    /**
     * Render completion panel (green)
     * Used to notify users that an action has been successfully
     * completed
     * Displays with green confirmation styling
     * @param {string} title - Panel title
     * @param {string} body - Panel body content
     * @param {Object} config - Configuration options
     * @returns {string} HTML string for completion panel
     * @private
     */
    _renderCompletionPanel(title, body, config) {
        const safeTitle = config.escapeHtml ?
            this._escapeHtml(title) : title;
        const safeBody = config.escapeHtml ?
            this._escapeHtml(body) : body;

        return `
<div class="dp-panel dp-panel--confirmation">
  <h1 class="dp-panel__title">
    ${safeTitle}
  </h1>
  <div class="dp-panel__body">
    ${safeBody}
  </div>
</div>`;
    }

    /**
     * Render information panel (blue)
     * Reserved for future implementation
     * Used to provide important information to users
     * Displays with blue informational styling
     * @param {string} title - Panel title
     * @param {string} body - Panel body content
     * @param {Object} config - Configuration options
     * @returns {string} HTML string for information panel
     * @private
     */
    _renderInformationPanel(title, body, config) {
        const safeTitle = config.escapeHtml ?
            this._escapeHtml(title) : title;
        const safeBody = config.escapeHtml ?
            this._escapeHtml(body) : body;

        return `
<div class="dp-panel dp-panel--information">
  <h1 class="dp-panel__title">
    ${safeTitle}
  </h1>
  <div class="dp-panel__body">
    ${safeBody}
  </div>
</div>`;
    }

    /**
     * Render warning panel (yellow)
     * Reserved for future implementation
     * Used to display important warnings to users
     * Displays with yellow warning styling
     * @param {string} title - Panel title
     * @param {string} body - Panel body content
     * @param {Object} config - Configuration options
     * @returns {string} HTML string for warning panel
     * @private
     */
    _renderWarningPanel(title, body, config) {
        const safeTitle = config.escapeHtml ?
            this._escapeHtml(title) : title;
        const safeBody = config.escapeHtml ?
            this._escapeHtml(body) : body;

        return `
<div class="dp-panel dp-panel--warning">
  <h1 class="dp-panel__title">
    ${safeTitle}
  </h1>
  <div class="dp-panel__body">
    ${safeBody}
  </div>
</div>`;
    }

    /**
     * Escape HTML entities to prevent XSS attacks
     * Converts special characters to HTML entities
     * Only used when escapeHtml option is true
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     * @private
     */
    _escapeHtml(str) {
        if (str === null || str === undefined) {
            return '';
        }
        str = String(str);
        const htmlEscapeMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        return str.replace(/[&<>"'\/]/g, (match) =>
            htmlEscapeMap[match]);
    }
}

module.exports = FlashPanelHelper;
