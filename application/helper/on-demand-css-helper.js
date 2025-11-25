// application/helper/onDemandCssHelper.js
// View helper to load module-specific CSS on demand
const fs = require('fs');
const path = require('path');
const AbstractHelper = require(global.applicationPath('/library/mvc/view/helper/abstract-helper'));

class OnDemandCssHelper extends AbstractHelper {
    /**
     * Generate inline CSS for module, controller, and action-specific CSS
     * @param {string} moduleName - Module name
     * @param {string} controllerName - Controller name (optional)
     * @param {string} controllerActionName - Controller action name (optional)
     * @returns {string} HTML style tags with CSS content
     */
    cssLinkTag(moduleName, controllerName = null, controllerActionName = null) {
        const cssContents = [];
        const basePath = global.applicationPath('/public/css/module');

        // 1. Module CSS path: /css/module/{moduleName}.css
        const moduleAbsPath = path.join(basePath, `${moduleName}.css`);
        if (fs.existsSync(moduleAbsPath)) {
            try {
                const cssContent = fs.readFileSync(moduleAbsPath, 'utf8');
                cssContents.push(cssContent);
            } catch (err) {
                console.error(`Error reading module CSS (${moduleName}):`, err.message);
            }
        }

        // 2. Controller CSS path: /css/module/{moduleName}/{controllerName}.css
        if (controllerName) {
            const controllerAbsPath = path.join(basePath, moduleName, `${controllerName}.css`);
            if (fs.existsSync(controllerAbsPath)) {
                try {
                    const cssContent = fs.readFileSync(controllerAbsPath, 'utf8');
                    cssContents.push(cssContent);
                } catch (err) {
                    console.error(`Error reading controller CSS (${moduleName}/${controllerName}):`, err.message);
                }
            }
        }

        // 3. Action CSS path: /css/module/{moduleName}/{controllerName}/{action}.css
        if (controllerName && controllerActionName) {
            const actionAbsPath = path.join(basePath, moduleName, controllerName, `${controllerActionName}.css`);
            if (fs.existsSync(actionAbsPath)) {
                try {
                    const cssContent = fs.readFileSync(actionAbsPath, 'utf8');
                    cssContents.push(cssContent);
                } catch (err) {
                    console.error(`Error reading action CSS (${moduleName}/${controllerName}/${controllerActionName}):`, err.message);
                }
            }
        }

        // Return all CSS contents wrapped in a single <style> tag
        if (cssContents.length > 0) {
            return `<style>${cssContents.join('\n')}</style>`;
        }

        return '';
    }

    /**
     * Render module, controller, and action-specific CSS
     * Reads module, controller, and action names from Nunjucks context variables set by BaseController
     * @returns {string} HTML style tags with CSS content
     */
    render(...args) {
        // Extract Nunjucks context from arguments
        this._extractContext(args);

        // Get module, controller, and action names from context (set by BaseController in dispatch)
        const moduleName = this.getVariable('_moduleName');
        const controllerName = this.getVariable('_controllerName');
        const actionName = this.getVariable('_actionName');

        if (!moduleName) {
            console.log('[OnDemandCss] No module name, returning empty');
            return '';
        }

        const result = this.cssLinkTag(moduleName, controllerName, actionName);
        console.log('[OnDemandCss] CSS result length:', result.length);
        return result;
    }
}

module.exports = OnDemandCssHelper;
