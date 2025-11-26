const AbstractHelper = require(global.applicationPath('/library/mvc/view/helper/abstract-helper'));

/**
 * FlashBannerHelper
 * Renders GOV.UK style notification banners for flash messages
 * Usage: {{ flashBanner('success', successMessages) | safe }}
 *        {{ flashBanner('error', errorMessages) | safe }}
 */
class FlashBannerHelper extends AbstractHelper {

    constructor() {
        super();
        this.urlHelper = null;
    }

    /**
     * Set URL helper for generating links
     * @param {Url} urlHelper - URL helper instance
     */
    setUrlHelper(urlHelper) {
        this.urlHelper = urlHelper;
    }

    /**
     * Render flash banner
     * @param {string} type - Banner type: 'success' or 'error'
     * @param {Array} messages - Array of messages to display
     * @returns {string} HTML string for the banner
     */
    render(...args) {
        // Extract Nunjucks context from arguments
        const cleanArgs = this._extractContext(args);
        const [type = 'success', messages = []] = cleanArgs;

        // Return empty string if no messages
        if (!Array.isArray(messages) || messages.length === 0) {
            return '';
        }

        if (type === 'error') {
            return this._renderErrorBanner(messages);
        } else {
            return this._renderSuccessBanner(messages);
        }
    }

    /**
     * Render success notification banner
     * @private
     */
    _renderSuccessBanner(messages) {
        const messageList = messages.map(msg => `<p class="dp-notification-banner__message">${this._escapeHtml(msg)}</p>`).join('');

        return `
        <div class="dp-notification-banner dp-notification-banner--success">
            <div class="dp-notification-banner__header">
                <h2 class="dp-notification-banner__title">Success</h2>
            </div>
            <div class="dp-notification-banner__content">
                <h3 class="dp-notification-banner__heading">Success</h3>
                ${messageList} <br>
                <a href="${this.urlHelper.fromRoute('adminDashboardIndex')}" class="dp-button">Back to Dashboard</a>
            </div>
        </div>`;
    }

    /**
     * Render error summary banner
     * @private
     */
    _renderErrorBanner(messages) {
        const messageList = messages.map(msg => `<li>${this._escapeHtml(msg)}</li>`).join('');

        return `
        <div class="dp-error-summary" role="alert" aria-labelledby="error-summary-title" tabindex="-1">
            <h2 class="dp-error-summary__title" id="error-summary-title">There is a problem</h2>
            <div class="dp-error-summary__body">
                <ul class="dp-error-summary__list">
                    ${messageList}
                </ul>
            </div>
        </div>`;
    }

    /**
     * Escape HTML entities to prevent XSS
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
        return str.replace(/[&<>"'\/]/g, (match) => htmlEscapeMap[match]);
    }
}

module.exports = FlashBannerHelper;
