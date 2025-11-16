const AbstractHelper = require(global.applicationPath('/library/view/helper/abstractHelper'));

/**
 * PaginationHelper - Renders NEWER/OLDER navigation for posts and articles
 * Usage in template:
 *   Posts: {{ pages(pagination) | safe }}
 *   Articles: {{ pages({mode: 'article', prevArticle: prevArticle, nextArticle: nextArticle}) | safe }}
 */
class PaginationHelper extends AbstractHelper {
    /**
     * Renders pagination HTML with NEWER and OLDER buttons
     *
     * @param {Object} options - Pagination configuration
     * @param {string} options.mode - 'posts' (default) or 'article'
     *
     * For posts mode:
     * @param {number} options.totalPages - Total number of pages
     * @param {boolean} options.hasNext - Whether there is a next page
     * @param {boolean} options.hasPrev - Whether there is a previous page
     * @param {number} options.nextPage - Next page number
     * @param {number} options.prevPage - Previous page number
     * @param {string} options.baseUrl - Base URL for pagination links
     *
     * For article mode:
     * @param {Object} options.prevArticle - Previous article {slug, category_slug}
     * @param {Object} options.nextArticle - Next article {slug, category_slug}
     *
     * @returns {string} - HTML string for pagination
     */
    render(options = {}) {
        const mode = options.mode || 'posts';

        if (mode === 'article') {
            return this._renderArticleNavigation(options);
        } else {
            return this._renderPostsNavigation(options);
        }
    }

    /**
     * Render navigation for posts (page-based pagination)
     * @private
     */
    _renderPostsNavigation(options) {
        const {
            totalPages = 1,
            hasNext = false,
            hasPrev = false,
            nextPage = 2,
            prevPage = 0,
            baseUrl = ''
        } = options;

        // Don't render pagination if there's only one page
        if (totalPages <= 1) {
            return '';
        }

        let html = `
        <nav aria-label="Post navigation" class="dailypolitics-!-margin-top-8 dailypolitics-!-margin-bottom-8">
            <ul class="pagination justify-content-between" style="display: flex;">`;

        // NEWER POSTS button (previous page) - left side
        if (hasPrev) {
            const newerUrl = prevPage === 1 ? baseUrl || '/' : `${baseUrl}/page/${prevPage}/index.html`;
            html += `
                <li class="page-item">
                    <a class="btn btn-primary green" href="${newerUrl}" rel="prev" style="border-color: #00703C; outline: 2px solid #FFD600; outline-offset: 2px;">
                        ← Newer Posts
                    </a>
                </li>`;
        } else {
            html += `<li class="page-item" style="visibility: hidden;"><span class="btn">← Newer Posts</span></li>`;
        }

        // OLDER POSTS button (next page) - right side
        if (hasNext) {
            html += `
                <li class="page-item">
                    <a class="btn btn-primary green" href="${baseUrl}/page/${nextPage}/index.html" rel="next" style="border-color: #00703C; outline: 2px solid #FFD600; outline-offset: 2px;">
                        Older Posts →
                    </a>
                </li>`;
        } else {
            html += `<li class="page-item" style="visibility: hidden;"><span class="btn">Older Posts →</span></li>`;
        }

        html += `
            </ul>
        </nav>`;

        return html;
    }

    /**
     * Render navigation for articles (prev/next article links)
     * @private
     */
    _renderArticleNavigation(options) {
        const {
            prevArticle = null,
            nextArticle = null
        } = options;

        // Don't render if both prev and next are null
        if (!prevArticle && !nextArticle) {
            return '';
        }

        let html = `
        <nav aria-label="Article navigation" class="dailypolitics-!-margin-top-8 dailypolitics-!-margin-bottom-8">
            <ul class="pagination justify-content-between" style="display: flex;">`;

        // NEWER ARTICLE button (previous article) - left side
        if (prevArticle) {
            const prevUrl = `/${prevArticle.category_slug || 'general'}/articles/${prevArticle.slug}`;
            html += `
                <li class="page-item">
                    <a class="btn btn-primary green" href="${prevUrl}" rel="prev" style="border-color: #00703C; outline: 2px solid #FFD600; outline-offset: 2px;">
                        ← Next Article
                    </a>
                </li>`;
        } else {
            html += `<li class="page-item" style="visibility: hidden;"><span class="btn">← Next Article</span></li>`;
        }

        // OLDER ARTICLE button (next article) - right side
        if (nextArticle) {
            const nextUrl = `/${nextArticle.category_slug || 'general'}/articles/${nextArticle.slug}`;
            html += `
                <li class="page-item">
                    <a class="btn btn-primary green" href="${nextUrl}" rel="next" style="border-color: #00703C; outline: 2px solid #FFD600; outline-offset: 2px;">
                        Previous Article →
                    </a>
                </li>`;
        } else {
            html += `<li class="page-item" style="visibility: hidden;"><span class="btn">Previous Article →</span></li>`;
        }

        html += `
            </ul>
        </nav>`;

        return html;
    }
}

module.exports = PaginationHelper;
