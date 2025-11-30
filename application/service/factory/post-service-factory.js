// application/service/factory/post-service-factory.js
// Factory for creating PostService with ServiceManager injected

const AbstractFactory = require(global.applicationPath('/library/mvc/service/abstract-factory'));
const PostService = require(global.applicationPath('/application/service/post-service'));

/**
 * PostServiceFactory
 * Creates PostService instance with ServiceManager injected
 */
class PostServiceFactory extends AbstractFactory {
    /**
     * Create PostService instance
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {PostService} PostService instance
     */
    createService(serviceManager) {
        try {
            // Create PostService instance
            const postService = new PostService();

            // Inject ServiceManager into the service
            postService.setServiceManager(serviceManager);

            return postService;

        } catch (error) {
            console.error('Could not create PostService:', error.message);
            throw error;
        }
    }
}

module.exports = PostServiceFactory;
