const AbstractHelper = require(global.applicationPath('/library/view/helper/abstractHelper'));

/**
 * PaginationHelper - Renders NEWER POSTS / OLDER POSTS navigation
 * Usage in template: {{ pages(pagination) | safe }}
 */
class PaginationHelper extends AbstractHelper {
    /**
     * Renders pagination HTML with NEWER POSTS and OLDER POSTS buttons
     *
     * @param {Object} options - Pagination configuration
     * @param {number} options.currentPage - Current page number
     * @param {number} options.totalPages - Total number of pages
     * @param {boolean} options.hasNext - Whether there is a next page (older posts)
     * @param {boolean} options.hasPrev - Whether there is a previous page (newer posts)
     * @param {number} options.nextPage - Next page number (older posts)
     * @param {number} options.prevPage - Previous page number (newer posts)
     * @param {string} options.baseUrl - Base URL for pagination links (default: current path)
     * @returns {string} - HTML string for pagination
     */
    render(options = {}) {
        const {
            totalPages = 1,
            hasNext = false,
            hasPrev = false,
            nextPage = 2,
            prevPage = 0,
            baseUrl = ''
        } = options;

        // Don't render pagination if there's only one page or no pages
        if (totalPages <= 1) {
            return '';
        }

        let html = `
        <nav aria-label="Post navigation" class="dailypolitics-!-margin-top-8 dailypolitics-!-margin-bottom-8">
            <ul class="pagination justify-content-between" style="display: flex;">`;

        // NEWER POSTS button (previous page) - left side
        if (hasPrev) {
            const newerUrl = prevPage === 1 ? baseUrl || '/' : `${baseUrl}?page=${prevPage}`;
            html += `
                <li class="page-item">
                    <a class="btn btn-primary green" href="${newerUrl}" rel="prev" style="border-color: #00703C; outline: 2px solid #FFD600; outline-offset: 2px;">
                        ← NEWER POSTS
                    </a>
                </li>`;
        } else {
            // Empty spacer when on first page
            html += `<li class="page-item" style="visibility: hidden;"><span class="btn">← NEWER POSTS</span></li>`;
        }

        // OLDER POSTS button (next page) - right side
        if (hasNext) {
            html += `
                <li class="page-item">
                    <a class="btn btn-primary green" href="${baseUrl}?page=${nextPage}" rel="next" style="border-color: #00703C; outline: 2px solid #FFD600; outline-offset: 2px;">
                        OLDER POSTS →
                    </a>
                </li>`;
        } else {
            // Empty spacer when on last page
            html += `<li class="page-item" style="visibility: hidden;"><span class="btn">OLDER POSTS →</span></li>`;
        }

        html += `
            </ul>
        </nav>`;

        return html;
    }
}

module.exports = PaginationHelper;
