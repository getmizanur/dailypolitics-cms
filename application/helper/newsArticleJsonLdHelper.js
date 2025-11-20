const AbstractHelper = require(global.applicationPath('/library/view/helper/abstractHelper'));

/**
 * NewsArticleJsonLdHelper - Generates JSON-LD structured data for NewsArticle schema
 * Usage in template: {{ newsArticleJsonLd(posts) | safe }}
 * @see https://schema.org/NewsArticle
 */
class NewsArticleJsonLdHelper extends AbstractHelper {

    /**
     * Generate JSON-LD structured data for news articles
     * @param {Array|Object} data - Single post object or array of posts
     * @param {Object} options - Configuration options
     * @param {string} options.baseUrl - Base URL for the site (default: 'http://localhost:8080')
     * @param {string} options.publisherName - Publisher name (default: 'Daily Politics')
     * @param {string} options.publisherLogoUrl - Publisher logo URL
     * @returns {string} - JSON-LD script tag
     */
    render(...args) {
        // Extract Nunjucks context from arguments
        const cleanArgs = this._extractContext(args);
        const [data, options = {}] = cleanArgs;

        // Handle null or undefined data
        if (!data) {
            return '';
        }

        // Normalize to array
        const posts = Array.isArray(data) ? data : [data];

        // Filter out empty posts
        const validPosts = posts.filter(post => post && post.title);

        if (validPosts.length === 0) {
            return '';
        }

        // Default options
        const baseUrl = options.baseUrl || 'http://localhost:8080';
        const publisherName = options.publisherName || 'Daily Politics';
        const publisherLogoUrl = options.publisherLogoUrl || 'https://dailypolitics-assets.s3-eu-west-1.amazonaws.com/img/daily-politics-logo.png';

        // Generate JSON-LD for each post
        const jsonLdItems = validPosts.map(post => this.createNewsArticleSchema(post, baseUrl, publisherName, publisherLogoUrl));

        // If single item, return as object; if multiple, return as array in ItemList
        let jsonLd;
        if (jsonLdItems.length === 1) {
            jsonLd = jsonLdItems[0];
        } else {
            // Use ItemList for multiple articles
            jsonLd = {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": jsonLdItems.map((item, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": item
                }))
            };
        }

        // Return as script tag
        return `<script type="application/ld+json">${JSON.stringify(jsonLd, null, 2)}</script>`;
    }

    /**
     * Create NewsArticle schema for a single post
     * @private
     */
    createNewsArticleSchema(post, baseUrl, publisherName, publisherLogoUrl) {
        const categorySlug = post.category_slug || 'general';
        const articleUrl = `${baseUrl}/${categorySlug}/articles/${post.slug}/index.html`;

        const schema = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": post.title,
            "url": articleUrl,
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": articleUrl
            }
        };

        // Add optional fields if available
        if (post.content) {
            // Create description from content (truncate to ~200 chars)
            const strippedContent = post.content.replace(/<[^>]*>/g, '');
            const description = strippedContent.length > 200
                ? strippedContent.substring(0, 200).trim() + '...'
                : strippedContent.trim();
            schema.description = description;
            schema.articleBody = strippedContent;
        }

        if (post.hero_image_url) {
            schema.image = {
                "@type": "ImageObject",
                "url": post.hero_image_url
            };

            if (post.hero_image_caption) {
                schema.image.caption = post.hero_image_caption;
            }
        }

        if (post.published_at) {
            schema.datePublished = new Date(post.published_at).toISOString();
        }

        if (post.updated_at) {
            schema.dateModified = new Date(post.updated_at).toISOString();
        } else if (post.published_at) {
            // Use published date as modified date if not available
            schema.dateModified = new Date(post.published_at).toISOString();
        }

        if (post.author_name) {
            schema.author = {
                "@type": "Person",
                "name": post.author_name
            };
        }

        // Add publisher information
        schema.publisher = {
            "@type": "Organization",
            "name": publisherName,
            "logo": {
                "@type": "ImageObject",
                "url": publisherLogoUrl
            }
        };

        // Add category as articleSection if available
        if (post.category_name) {
            schema.articleSection = post.category_name;
        }

        return schema;
    }

}

module.exports = NewsArticleJsonLdHelper;
