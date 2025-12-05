const Controller = require(global.applicationPath('/library/mvc/controller/base-controller'));

class IndexController extends Controller {

    constructor(options = {}) {
        super(options);
    }

    preDispatch() {
        // No additional logic needed - BaseController handles module name automatically
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

            return this.getView();
        } catch (error) {
            console.error('Error in viewAction:', error);
            throw error;
        }
    }

    /**
     * Display contact form and handle submission
     */
    async contactAction() {
        try {
            // Import ContactForm
            const ContactForm = require(global.applicationPath('/application/form/contact-form'));

            // Create form instance
            const form = new ContactForm();
            form.setAction('/contact.html');
            form.setMethod('POST');

            // Add form fields
            form.addWhatsItToDoWithOptionField();
            form.addMessageField();
            form.addNameField();
            form.addEmailField();
            form.addReplyCheckbox();
            form.addCsrfField('csrf');
            form.addSubmitButton();

            // Check if form is submitted
            const request = this.getRequest();
            const isPost = request.isPost();

            if (isPost) {
                const postData = request.getPost();

                // Here you would add validation and processing logic
                // For now, we'll just show a success message

                this.plugin('flashMessenger').addSuccessMessage({
                    title: 'Message sent',
                    message: 'Thank you for contacting us. We\'ll get back to you soon.'
                });

                // Redirect to avoid form resubmission
                return this.plugin('redirect').toRoute('blogIndexContact');
            }

            // Set form in view
            this.getView()
                .setVariable('f', form);

            return this.getView();

        } catch (error) {
            console.error('Error in contactAction:', error);
            throw error;
        }
    }

}

module.exports = IndexController;