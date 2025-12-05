const AbstractHelper = require(global.applicationPath('/library/mvc/view/helper/abstract-helper'));

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
    render(...args) {
        // Extract Nunjucks context from arguments
        const cleanArgs = this._extractContext(args);
        const [options = {}] = cleanArgs;

        const mode = options.mode || 'posts';

        if (mode === 'article') {
            return this._renderArticleNavigation(options);
        } else if (mode === 'admin') {
            return this._renderAdminNumberedPagination(options);
        } else {
            return this._renderPostsNavigation(options);
        }
    }

    /**
     * Render navigation for posts (page-based pagination)
     * Using GOV.UK pagination component design with dp- prefix
     * @private
     */
    _renderPostsNavigation(options) {
        const {
            totalPages = 1,
            currentPage = 1,
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
        <nav class="dp-pagination dailypolitics-!-margin-top-8 dailypolitics-!-margin-bottom-8" aria-label="Pagination">`;

        // Previous page (newer posts)
        if (hasPrev) {
            const newerUrl = prevPage === 1 ? baseUrl || '/' : `${baseUrl}/page/${prevPage}/index.html`;
            html += `
            <div class="dp-pagination__prev">
                <a class="dp-pagination__link" href="${newerUrl}" rel="prev">
                    <svg class="dp-pagination__icon dp-pagination__icon--prev" xmlns="http://www.w3.org/2000/svg" height="13" width="15" aria-hidden="true" focusable="false" viewBox="0 0 15 13">
                        <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
                    </svg>
                    <span class="dp-pagination__link-title">
                        Previous<span class="dp-visually-hidden"> page</span>
                    </span>
                    <span class="dp-pagination__link-label">${prevPage} of ${totalPages}</span>
                </a>
            </div>`;
        }

        // Next page (older posts)
        if (hasNext) {
            html += `
            <div class="dp-pagination__next">
                <a class="dp-pagination__link" href="${baseUrl}/page/${nextPage}/index.html" rel="next">
                    <span class="dp-pagination__link-title">
                        Next<span class="dp-visually-hidden"> page</span>
                    </span>
                    <span class="dp-pagination__link-label">${nextPage} of ${totalPages}</span>
                    <svg class="dp-pagination__icon dp-pagination__icon--next" xmlns="http://www.w3.org/2000/svg" height="13" width="15" aria-hidden="true" focusable="false" viewBox="0 0 15 13">
                        <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
                    </svg>
                </a>
            </div>`;
        }

        html += `
        </nav>`;

        return html;
    }

    /**
     * Render navigation for articles (prev/next article links)
     * Using GOV.UK pagination component design with dp- prefix
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
        <nav class="dp-pagination dailypolitics-!-margin-top-8 dailypolitics-!-margin-bottom-8" aria-label="Article navigation">`;

        // Previous article link
        if (prevArticle) {
            const prevUrl = `/articles/${prevArticle.slug}/index.html`;
            html += `
            <div class="dp-pagination__prev">
                <a class="dp-pagination__link" href="${prevUrl}" rel="prev">
                    <svg class="dp-pagination__icon dp-pagination__icon--prev" xmlns="http://www.w3.org/2000/svg" height="13" width="15" aria-hidden="true" focusable="false" viewBox="0 0 15 13">
                        <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
                    </svg>
                    <span class="dp-pagination__link-title">
                        Previous<span class="dp-visually-hidden"> article</span>
                    </span>
                </a>
            </div>`;
        }

        // Next article link
        if (nextArticle) {
            const nextUrl = `/articles/${nextArticle.slug}/index.html`;
            html += `
            <div class="dp-pagination__next">
                <a class="dp-pagination__link" href="${nextUrl}" rel="next">
                    <span class="dp-pagination__link-title">
                        Next<span class="dp-visually-hidden"> article</span>
                    </span>
                    <svg class="dp-pagination__icon dp-pagination__icon--next" xmlns="http://www.w3.org/2000/svg" height="13" width="15" aria-hidden="true" focusable="false" viewBox="0 0 15 13">
                        <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
                    </svg>
                </a>
            </div>`;
        }

        html += `
        </nav>`;

        return html;
    }

     /**
     * Render numbered pagination for admin dashboard (10 articles per page)
     * @param {Object} options - { currentPage, totalItems, baseUrl }
     * @returns {string} - HTML string for numbered pagination
     */
    _renderAdminNumberedPagination(options = {}) {
        const {
            currentPage = 1,
            totalItems = 0,
            baseUrl = ''
        } = options;
        const perPage = 10;
        const totalPages = Math.ceil(totalItems / perPage);
        if (totalPages <= 1) return '';

        let html = `\n<nav aria-label="Admin pagination" class="mt-5 mb-5">\n  <ul class="pagination justify-content-center" style="margin-top: 2rem; margin-bottom: 2rem;">`;

        // Previous button
        if (currentPage > 1) {
            const prevUrl = currentPage === 2 ? baseUrl || '/admin/posts' : `${baseUrl}/page/${currentPage - 1}`;
            html += `\n    <li class="page-item"><a class="page-link" href="${prevUrl}" rel="prev">&laquo; Prev</a></li>`;
        } else {
            html += `\n    <li class="page-item disabled"><span class="page-link">&laquo; Prev</span></li>`;
        }

        // Numbered page links with ellipsis
        // Show: 1 ... 4 5 [6] 7 8 ... 20
        // Logic: Always show first, last, current, and 2 pages on each side of current
        const delta = 2; // Pages to show on each side of current
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        for (let i of rangeWithDots) {
            if (i === '...') {
                html += `\n    <li class="page-item disabled"><span class="page-link">...</span></li>`;
            } else {
                let pageUrl = i === 1 ? baseUrl || '/admin/posts' : `${baseUrl}/page/${i}`;
                if (i === currentPage) {
                    html += `\n    <li class="page-item active"><span class="page-link">${i}</span></li>`;
                } else {
                    html += `\n    <li class="page-item"><a class="page-link" href="${pageUrl}">${i}</a></li>`;
                }
            }
        }

        // Next button
        if (currentPage < totalPages) {
            const nextUrl = `${baseUrl}/page/${currentPage + 1}`;
            html += `\n    <li class="page-item"><a class="page-link" href="${nextUrl}" rel="next">Next &raquo;</a></li>`;
        } else {
            html += `\n    <li class="page-item disabled"><span class="page-link">Next &raquo;</span></li>`;
        }

        html += `\n  </ul>\n</nav>`;
        return html;
    }
}

module.exports = PaginationHelper;
