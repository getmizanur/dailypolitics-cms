// application/helper/onDemandCssHelper.js
// View helper to load module-specific CSS on demand
const fs = require('fs');
const path = require('path');
const routesConfig = require(global.applicationPath('/application/config/routes.config.js'));

class OnDemandCssHelper {
    getModuleName(controller) {
        // Try to get route name from request or controller
        const req = controller && controller.getRequest && controller.getRequest();
        let routeName = null;
        if (req && typeof req.getRouteName === 'function') {
            routeName = req.getRouteName();
        }
        if (!routeName && req && req.routeName) {
            routeName = req.routeName;
        }
        if (!routeName) {
            // fallback: try controller property
            routeName = controller && controller.routeName;
        }
        if (!routeName) return null;
        // Find module name from routes config
        const routeDef = routesConfig.routes[routeName];
        if (routeDef && routeDef.module) {
            return routeDef.module;
        }
        return null;
    }

    cssLinkTag(moduleName) {
        const cssPath = `/css/module/${moduleName}.css`;
        const absPath = path.join(global.applicationPath('/public/css/module'), `${moduleName}.css`);
        if (fs.existsSync(absPath)) {
            // Inline critical CSS to avoid render-blocking
            try {
                const cssContent = fs.readFileSync(absPath, 'utf8');
                return `<style>${cssContent}</style>`;
            } catch (err) {
                // Fallback to link tag if inline fails
                return `<link rel="stylesheet" href="${cssPath}" />`;
            }
        }
        return '';
    }

    render(controller) {
        const moduleName = this.getModuleName(controller);
        if (!moduleName) return '';
        return this.cssLinkTag(moduleName);
    }
}

module.exports = OnDemandCssHelper;
