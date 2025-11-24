// application/service/factory/authenticationServiceFactory.js
// Factory for creating AuthenticationService with session storage

const AbstractFactory = require(global.applicationPath('/library/service/abstract-factory'));
const AuthenticationService = require(global.applicationPath('/library/authentication/authentication-service'));
const SessionStorage = require(global.applicationPath('/library/authentication/storage/session'));

/**
 * AuthenticationServiceFactory
 * Creates AuthenticationService with session storage from Request
 */
class AuthenticationServiceFactory extends AbstractFactory {
    /**
     * Create AuthenticationService instance
     * @param {ServiceManager} serviceManager - Service manager instance
     * @returns {AuthenticationService} AuthenticationService instance
     */
    createService(serviceManager) {
        try {
            // Get the Request object from ServiceManager
            const request = serviceManager.get('Request');

            if (!request) {
                throw new Error('Request not available in service manager');
            }

            // Get the session from the Request
            const session = request.getSession();

            if (!session) {
                throw new Error('Session not available in request');
            }

            console.log('[AuthServiceFactory] Session ID:', session.id);
            console.log('[AuthServiceFactory] Session customData:', JSON.stringify(session.customData));

            // Create SessionStorage with the session
            const storage = new SessionStorage(session);

            // Create and return AuthenticationService with session storage
            const authService = new AuthenticationService(storage);

            return authService;

        } catch (error) {
            console.error('Could not create AuthenticationService:', error.message);
            throw error;
        }
    }
}

module.exports = AuthenticationServiceFactory;
