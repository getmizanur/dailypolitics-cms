const Controller = require(global.applicationPath('/library/controller/baseController'));

class Index extends Controller {

    constructor(options = {}) {
        super(options);
    }

    preDispatch() {
        // IMPORTANT NOTICE:
        // Expose the current controller to the view context so that view helpers
        // (such as onDemandCss) can access routing and request information.
        // This is required for onDemandCss to determine the current module and load
        // the correct CSS file dynamically based on the route.
        //
        // This was done because main.css was too big and had to be split up
        // for better maintainability and understanding. Admin-specific and 
        // bolg-specific CSS is now loaded on demand using onDemandCss.
        //
        // If you wish to remove this line, you must also:
        //   1. Remove {{ onDemandCss(controller) }} from master.njk
        //   2. Deregister 'onDemandCss' from application.config.js under view_helpers
        this.getView().setVariable('controller', this);
    }

    /**
     * Display all published posts (blog index page)
     */
    async indexAction() {
        try {
            const postService = this.getServiceManager().get('PostService');
            const page = parseInt(this.getParam('page')) || 1;
            const limit = 2;
            const offset = (page - 1) * limit;

            // Fetch posts and total count for pagination
            const [posts, totalCount] = await Promise.all([
                postService.getAllPublishedPosts(limit, offset),
                postService.getPostCount()
            ]);

            // Get recent posts for sidebar
            const recentPosts = await postService.getRecentPostsForSidebar();

            // Calculate pagination
            const totalPages = Math.ceil(totalCount / limit);

            // Set page title
            this.getPluginManager().get('pageTitle').setTitle('Blog');

            // Set view variables
            this.getView()
                .setVariable('posts', posts)
                .setVariable('recentPosts', recentPosts)
                .setVariable('pagination', {
                    currentPage: page,
                    totalPages: totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                    nextPage: page + 1,
                    prevPage: page - 1
                });

            return this.getView();

        } catch (error) {
            console.error('Error in indexAction:', error);
            throw error;
        }
    }

    /**
     * Display single post by slug
     */
    async viewAction() {
        try {
            const postService = this.getServiceManager().get('PostService');
            const slug = this.getParam('slug');

            if (!slug) {
                return this.notFoundAction();
            }

            // Fetch post by slug
            const post = await postService.getSinglePost(slug, true);

            if (!post) {
                return this.notFoundAction();
            }

            // Get recent posts for sidebar, prev/next articles in parallel
            const [recentPosts, nextArticle, prevArticle] = await Promise.all([
                postService.getRecentPostsForSidebar(),
                postService.getNextArticle(post.published_at, post.id),
                postService.getPreviousArticle(post.published_at, post.id)
            ]);

            // Set view variables
            this.getView().setVariable('post', post);
            this.getView().setVariable('recentPosts', recentPosts);
            this.getView().setVariable('nextArticle', nextArticle);
            this.getView().setVariable('prevArticle', prevArticle);

            // Set page title and meta description
            this.getPluginManager().get('pageTitle').setTitle(post.title + ' - Daily Politics');
            
            return this.getView();
        } catch (error) {
            console.error('Error in viewAction:', error);
            throw error;
        }
    }

}

module.exports = Index;