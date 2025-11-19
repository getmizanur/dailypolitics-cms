// Routes configuration for the application
// This file defines all the URL routes and their corresponding modules, controllers, and actions

module.exports = {
    "routes": {
        // Admin section routes
        "adminIndexIndex": {
            "route": "/admin",
            "module": "admin",
            "controller": "index",
            "action": "index"
        },
        "adminIndexDashboard": {
            "route": "/admin/dashboard(/page/:page)?",
            "module": "admin",
            "controller": "index",
            "action": "dashboard"
        },
         "adminIndexView": {
            "route": "/admin/dashboard/view/:slug",
            "module": "admin",
            "controller": "index",
            "action": "view"
        },
        "adminIndexEdit": {
            "route": "/admin/dashboard/edit",
            "module": "admin",
            "controller": "index",
            "action": "edit-article"
        },
        "adminIndexDelete": {
            "route": "/admin/dashboard/delete/:slug",
            "module": "admin",
            "controller": "index",
            "action": "delete"
        },
        "adminIndexLogout": {
            "route": "/admin/dashboard/logout",
            "module": "admin",
            "controller": "index",
            "action": "logout"
        },

        // Blog section routes
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