const AbstractHelper = require(global.applicationPath('/library/view/helper/abstractHelper'));

class PaginationHelper extends AbstractHelper {
    /**
     * Renders pagination HTML
     * Usage in template: {{ pagination(paginationData) | safe }}
     *
     * @param {Object} options - Pagination configuration
     * @param {number} options.currentPage - Current page number
     * @param {number} options.totalPages - Total number of pages
     * @param {boolean} options.hasNext - Whether there is a next page
     * @param {boolean} options.hasPrev - Whether there is a previous page
     * @param {number} options.nextPage - Next page number
     * @param {number} options.prevPage - Previous page number
     * @param {string} options.baseUrl - Base URL for pagination links (default: current path)
     * @param {number} options.maxVisible - Maximum number of page links to show (default: 5)
     * @returns {string} - HTML string for pagination
     */
    render(options = {}) {
        const {
            currentPage = 1,
            totalPages = 1,
            hasNext = false,
            hasPrev = false,
            nextPage = 2,
            prevPage = 0,
            baseUrl = '',
            maxVisible = 4
        } = options;

        // Don't render pagination if there's only one page or no pages
        if (totalPages <= 1) {
            return '';
        }

        // Calculate page range to display
        const pageRange = this._calculatePageRange(currentPage, totalPages, maxVisible);

        let html = `
        <nav aria-label="Page navigation" class="dailypolitics-!-margin-top-8 dailypolitics-!-margin-bottom-8">
            <ul class="pagination justify-content-center">`;

        // Previous button
        if (hasPrev) {
            html += `
                <li class="page-item">
                    <a class="page-link" href="${baseUrl}?page=${prevPage}" aria-label="Previous">
                        <span aria-hidden="true">&laquo; Previous</span>
                    </a>
                </li>`;
        } else {
            html += `
                <li class="page-item disabled">
                    <span class="page-link" aria-label="Previous">
                        <span aria-hidden="true">&laquo; Previous</span>
                    </span>
                </li>`;
        }

        // First page + ellipsis if needed
        if (pageRange.showFirstEllipsis) {
            html += `
                <li class="page-item">
                    <a class="page-link" href="${baseUrl}?page=1">1</a>
                </li>
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>`;
        }

        // Page numbers
        pageRange.pages.forEach(page => {
            if (page === currentPage) {
                html += `
                <li class="page-item active" aria-current="page">
                    <span class="page-link">
                        ${page}
                        <span class="sr-only">(current)</span>
                    </span>
                </li>`;
            } else {
                html += `
                <li class="page-item">
                    <a class="page-link" href="${baseUrl}?page=${page}">${page}</a>
                </li>`;
            }
        });

        // Last page + ellipsis if needed
        if (pageRange.showLastEllipsis) {
            html += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
                <li class="page-item">
                    <a class="page-link" href="${baseUrl}?page=${totalPages}">${totalPages}</a>
                </li>`;
        }

        // Next button
        if (hasNext) {
            html += `
                <li class="page-item">
                    <a class="page-link" href="${baseUrl}?page=${nextPage}" aria-label="Next">
                        <span aria-hidden="true">Next &raquo;</span>
                    </a>
                </li>`;
        } else {
            html += `
                <li class="page-item disabled">
                    <span class="page-link" aria-label="Next">
                        <span aria-hidden="true">Next &raquo;</span>
                    </span>
                </li>`;
        }

        html += `
            </ul>
        </nav>`;

        return html;
    }

    /**
     * Calculate which page numbers to display
     * @private
     */
    _calculatePageRange(currentPage, totalPages, maxVisible) {
        const pages = [];
        let showFirstEllipsis = false;
        let showLastEllipsis = false;

        // If total pages is less than max visible, show all
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
            return { pages, showFirstEllipsis, showLastEllipsis };
        }

        // Calculate the range around current page
        const halfVisible = Math.floor(maxVisible / 2);
        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, currentPage + halfVisible);

        // Adjust if we're near the beginning
        if (currentPage <= halfVisible + 1) {
            startPage = 1;
            endPage = Math.min(maxVisible, totalPages);
        }
        // Adjust if we're near the end
        else if (currentPage >= totalPages - halfVisible) {
            startPage = Math.max(1, totalPages - maxVisible + 1);
            endPage = totalPages;
        }

        // Show first page and ellipsis if start is not at the beginning
        if (startPage > 1) {
            showFirstEllipsis = true;
            startPage = Math.max(2, startPage); // Start from 2 since 1 is shown separately
        }

        // Show last page and ellipsis if end is not at the end
        if (endPage < totalPages) {
            showLastEllipsis = true;
            endPage = Math.min(totalPages - 1, endPage); // End at totalPages-1 since last is shown separately
        }

        // Build pages array
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return { pages, showFirstEllipsis, showLastEllipsis };
    }
}

module.exports = PaginationHelper;
