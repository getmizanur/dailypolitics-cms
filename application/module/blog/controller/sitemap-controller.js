const BaseController = require(global.applicationPath('/library/mvc/controller/base-controller'));

/**
 * SitemapController
 * Generates XML sitemap for search engines
 */
class SitemapController extends BaseController {

    /**
     * Sitemap action - generates XML sitemap
     * Route: /sitemap.xml
     */
    async sitemapAction() {
        try {
            // Get PostService
            const postService = this.getServiceManager().get('PostService');

            // Fetch all published posts
            const posts = await postService.getAllPublishedPosts(10000, 0);

            // Set response headers for XML
            const response = this.getResponse();
            response.setHeader('Content-Type', 'application/xml; charset=utf-8');

            // Prepare data for sitemap view
            const req = this.getRequest().getExpressRequest();
            const protocol = req.protocol || 'https';
            const host = req.get('host') || 'localhost:8080';
            const sitemapData = {
                posts: posts,
                baseUrl: `${protocol}://${host}`,
                currentDate: new Date().toISOString()
            };

            // Set variables for view
            this.getView()
                .setVariable('sitemap', sitemapData);

            return this.getView();

        } catch (error) {
            console.error('[SitemapController] Error generating sitemap:', error);

            // Return error as XML
            const response = this.getResponse();
            response.setHeader('Content-Type', 'application/xml; charset=utf-8');
            response.setHttpResponseCode(500);

            return '<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>';
        }
    }

}

module.exports = SitemapController;
