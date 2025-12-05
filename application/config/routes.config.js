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
            "controller": "post",
            "action": "list"
        },
        "adminDashboardNew": {
            "route": "/admin/posts/new",
            "module": "admin",
            "controller": "post",
            "action": "new"
        },
        "adminDashboardPage": {
            "route": "/admin/posts/page/:page",
            "module": "admin",
            "controller": "post",
            "action": "list"
        },
        "adminDashboardEdit": {
            "route": "/admin/posts/:id/edit",
            "module": "admin",
            "controller": "post",
            "action": "edit"
        },
        "adminDashboardEdit": {
            "route": "/admin/posts/:id/edit",
            "module": "admin",
            "controller": "post",
            "action": "edit"
        },
        "adminDashboardConfirmation": {
            "route": "/admin/posts/confirmation",
            "module": "admin",
            "controller": "post",
            "action": "confirmation"
        },
        "adminDashboardDelete": {
            "route": "/admin/posts/:slug/remove",
            "module": "admin",
            "controller": "post",
            "action": "delete"
        },
        "adminDashboardPreview": {
            "route": "/admin/posts/:post_id/preview",
            "module": "admin",
            "controller": "post",
            "action": "view"
        },


        "adminLoginLogout": {
            "route": "/admin/logout",
            "module": "admin",
            "controller": "login",
            "action": "logout"
        },


        "adminRevisionNew": {
            "route": "/admin/posts/:post_id/revisions/new",
            "module": "admin",
            "controller": "revision",
            "action": "new"
        },

         "adminRevisionEdit": {
            "route": "/admin/posts/:post_id/revisions/:id/edit",
            "module": "admin",
            "controller": "revision",
            "action": "edit"
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
            "route": "/articles/:slug/index.html",
            "module": "blog",
            "controller": "index",
            "action": "view"
        },
         "blogIndexContact": {
            "route": "/contact.html",
            "module": "blog",
            "controller": "index",
            "action": "contact"
        },
        "blogSitemapSitemap": {
            "route": "/sitemap.xml",
            "module": "blog",
            "controller": "sitemap",
            "action": "sitemap"
        }
    }
};