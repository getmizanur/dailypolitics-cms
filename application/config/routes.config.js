// Routes configuration for the application
// This file defines all the URL routes and their corresponding modules, controllers, and actions

module.exports = {
    "routes": {
        // Admin section routes
        "adminLoginIndex": {
            "route": "/admin",
            "module": "admin",
            "controller": "login",
            "action": "login"
        },
        "adminDashboardIndex": {
            "route": "/admin/posts",
            "module": "admin",
            "controller": "dashboard",
            "action": "list"
        },
        "adminDashboardNew": {
            "route": "/admin/posts/new",
            "module": "admin",
            "controller": "dashboard",
            "action": "new"
        },
        "adminDashboardPage": {
            "route": "/admin/posts/page/:page",
            "module": "admin",
            "controller": "dashboard",
            "action": "list"
        },
        "adminDashboardView": {
            "route": "/admin/posts/:slug/preview",
            "module": "admin",
            "controller": "dashboard",
            "action": "view"
        },
        "adminDashboardEdit": {
            "route": "/admin/posts/:slug/edit",
            "module": "admin",
            "controller": "dashboard",
            "action": "edit"
        },
        "adminDashboardConfirmation": {
            "route": "/admin/posts/confirmation",
            "module": "admin",
            "controller": "dashboard",
            "action": "confirmation"
        },
        "adminDashboardDelete": {
            "route": "/admin/posts/:slug/remove",
            "module": "admin",
            "controller": "dashboard",
            "action": "delete"
        },
        "adminLoginLogout": {
            "route": "/admin/posts/logout",
            "module": "admin",
            "controller": "login",
            "action": "logout"
        },

        // Blog section routes
        "blogIndexIndex": {
            "route": "/",
            "module": "blog",
            "controller": "index",
            "action": "index"
        },
        "blogIndexPage": {
            "route": "/page/:page/index.html",
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