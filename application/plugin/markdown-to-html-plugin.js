const BasePlugin = require(global.applicationPath('/library/mvc/controller/base-plugin'));

/**
 * MarkdownToHtml Plugin
 * Converts markdown text to HTML
 */
class MarkdownToHtmlPlugin extends BasePlugin {

    constructor(options = {}) {
        super(options);
        this.marked = null;
        this._initializeMarkdown();
    }

    /**
     * Initialize markdown library
     * Uses marked library if available, otherwise falls back to simple conversion
     * @private
     */
    _initializeMarkdown() {
        try {
            // Try to require marked library
            this.marked = require('marked');

            // Configure marked options for security and functionality
            this.marked.setOptions({
                gfm: true, // GitHub Flavored Markdown
                breaks: true, // Convert line breaks to <br>
                headerIds: true, // Add IDs to headers
                mangle: false, // Don't escape autolinked email addresses
                sanitize: false, // Don't sanitize HTML (we'll handle this separately if needed)
            });
        } catch (error) {
            // marked library not installed, will use fallback
            console.warn('marked library not found, using fallback markdown converter');
            this.marked = null;
        }
    }

    /**
     * Convert markdown to HTML
     * @param {string} markdown - Markdown text to convert
     * @param {Object} options - Conversion options
     * @returns {string} HTML output
     */
    convert(markdown, options = {}) {
        if (!markdown || typeof markdown !== 'string') {
            return '';
        }

        if (this.marked) {
            // Use marked library
            return this.marked.parse(markdown);
        } else {
            // Fallback to simple conversion
            return this._fallbackConvert(markdown);
        }
    }

    /**
     * Fallback markdown converter for basic markdown syntax
     * @param {string} markdown - Markdown text
     * @returns {string} HTML output
     * @private
     */
    _fallbackConvert(markdown) {
        let html = markdown;

        // YouTube embeds - Process before other replacements
        // Syntax: [youtube:VIDEO_ID] or [youtube:https://www.youtube.com/watch?v=VIDEO_ID]
        html = html.replace(/\[youtube:([^\]]+)\]/g, (match, videoId) => {
            // Extract video ID if full URL is provided
            let extractedId = videoId;

            // Handle youtube.com/watch?v=VIDEO_ID
            if (videoId.includes('youtube.com/watch?v=')) {
                extractedId = videoId.split('watch?v=')[1].split('&')[0];
            }
            // Handle youtu.be/VIDEO_ID
            else if (videoId.includes('youtu.be/')) {
                extractedId = videoId.split('youtu.be/')[1].split('?')[0];
            }

            return `<div class="video-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1em 0;">
                <iframe src="https://www.youtube.com/embed/${extractedId}"
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                </iframe>
            </div>`;
        });

        // Headings
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.+?)_/g, '<em>$1</em>');

        // Images - Process before links (images use ![alt](url) syntax)
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

        // Blockquotes
        html = html.replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>');

        // Unordered lists
        html = html.replace(/^\* (.*)$/gim, '<li>$1</li>');
        html = html.replace(/^- (.*)$/gim, '<li>$1</li>');

        // Wrap consecutive <li> in <ul>
        html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

        // Ordered lists
        html = html.replace(/^\d+\. (.*)$/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/gs, '<ol>$1</ol>');

        // Paragraphs - Process after block elements
        // Split by double newlines to identify paragraphs
        const blocks = html.split(/\n\n+/);
        html = blocks.map(block => {
            block = block.trim();

            // Skip empty blocks
            if (!block) {
                return '';
            }

            // Don't wrap block elements in <p> tags
            if (block.startsWith('<h1>') || block.startsWith('<h2>') || block.startsWith('<h3>') ||
                block.startsWith('<ul>') || block.startsWith('<ol>') ||
                block.startsWith('<blockquote>') || block.startsWith('<div class="video-embed"')) {
                return block;
            }

            // Wrap text content in <p> tags and convert single newlines to <br>
            return '<p>' + block.replace(/\n/g, '<br>') + '</p>';
        }).join('\n\n');

        return html;
    }

    /**
     * Check if marked library is available
     * @returns {boolean}
     */
    isMarkedAvailable() {
        return this.marked !== null;
    }
}

module.exports = MarkdownToHtmlPlugin;
