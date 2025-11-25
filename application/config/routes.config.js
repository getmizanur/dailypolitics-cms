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
            "route": "/admin/dashboard",
            "module": "admin",
            "controller": "dashboard",
            "action": "list"
        },
        "adminDashboardPage": {
            "route": "/admin/dashboard/page/:page",
            "module": "admin",
            "controller": "dashboard",
            "action": "list"
        },
        "adminDashboardView": {
            "route": "/admin/dashboard/view/:slug",
            "module": "admin",
            "controller": "dashboard",
            "action": "view"
        },
        "adminDashboardEdit": {
            "route": "/admin/dashboard/edit/:slug",
            "module": "admin",
            "controller": "dashboard",
            "action": "edit"
        },
        "adminDashboardDelete": {
            "route": "/admin/dashboard/delete/:slug",
            "module": "admin",
            "controller": "dashboard",
            "action": "delete"
        },
        "adminLoginLogout": {
            "route": "/admin/dashboard/logout",
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