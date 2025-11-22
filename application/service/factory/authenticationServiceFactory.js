// application/service/factory/authenticationServiceFactory.js
// Factory for creating AuthenticationService with session storage

const AbstractFactory = require(global.applicationPath('/library/service/abstractFactory'));
const AuthenticationService = require(global.applicationPath('/library/authentication/authenticationService'));
const SessionStorage = require(global.applicationPath('/library/authentication/storage/session'));

class AuthenticationServiceFactory extends AbstractFactory {
    createService(serviceManager) {
        try {
            const controller = serviceManager.getController();

            if (!controller) {
                throw new Error('Controller not available in service manager');
            }

            // Get the session from the controller
            const session = controller.getSession();

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
