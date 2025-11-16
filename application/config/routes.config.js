// Routes configuration for the application
// This file defines all the URL routes and their corresponding modules, controllers, and actions

module.exports = {
    "routes": {
        // Home page route
        "adminIndexIndex": {
            "route": "/admin",
            "module": "admin",
            "controller": "index",
            "action": "index"
        },
        "blogIndexIndex": {
            "route": "/(page/:page/index.html)?",
            "module": "blog",
            "controller": "index",
            "action": "index"
        },
        "blogIndexView": {
            "route": "/:category_slug/articles/:slug/index.html",
            "module": "blog",
            "controller": "index",
            "action": "view"
        }
    }
};