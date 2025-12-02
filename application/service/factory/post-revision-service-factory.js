// application/service/factory/post-revision-service-factory.js
// Factory for creating PostRevisionService with ServiceManager injected

const AbstractFactory = require(global.applicationPath('/library/mvc/service/abstract-factory'));
const PostRevisionService = require(global.applicationPath('/application/service/post-revision-service'));

/**
 * PostRevisionServiceFactory
 * Creates PostRevisionService instance with ServiceManager injected
 */
class PostRevisionServiceFactory extends AbstractFactory {
    /**
     * Create PostRevisionService instance
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {PostRevisionService} PostRevisionService instance
     */
    createService(serviceManager) {
        try {
            // Create PostRevisionService instance
            const postRevisionService = new PostRevisionService();

            // Inject ServiceManager into the service
            postRevisionService.setServiceManager(serviceManager);

            return postRevisionService;

        } catch (error) {
            console.error('Could not create PostRevisionService:', error.message);
            throw error;
        }
    }
}

module.exports = PostRevisionServiceFactory;
