// application/helper/on-demand-js-helper.js
// View helper to load module-specific JavaScript on demand
const fs = require('fs');
const path = require('path');
const AbstractHelper = require(global.applicationPath('/library/mvc/view/helper/abstract-helper'));

class OnDemandJsHelper extends AbstractHelper {
    /**
     * Generate inline JavaScript for module, controller, and action-specific JS
     * @param {string} moduleName - Module name
     * @param {string} controllerName - Controller name (optional)
     * @param {string} controllerActionName - Controller action name (optional)
     * @returns {string} HTML script tags with JavaScript content
     */
    jsScriptTag(moduleName, controllerName = null, controllerActionName = null) {
        const jsContents = [];
        const basePath = global.applicationPath('/public/js/module');

        // 1. Module JS path: /js/module/{moduleName}.js
        const moduleAbsPath = path.join(basePath, `${moduleName}.js`);
        if (fs.existsSync(moduleAbsPath)) {
            try {
                const jsContent = fs.readFileSync(moduleAbsPath, 'utf8');
                jsContents.push(jsContent);
            } catch (err) {
                console.error(`Error reading module JS (${moduleName}):`, err.message);
            }
        }

        // 2. Controller JS path: /js/module/{moduleName}/{controllerName}.js
        if (controllerName) {
            const controllerAbsPath = path.join(basePath, moduleName, `${controllerName}.js`);
            if (fs.existsSync(controllerAbsPath)) {
                try {
                    const jsContent = fs.readFileSync(controllerAbsPath, 'utf8');
                    jsContents.push(jsContent);
                } catch (err) {
                    console.error(`Error reading controller JS (${moduleName}/${controllerName}):`, err.message);
                }
            }
        }

        // 3. Action JS path: /js/module/{moduleName}/{controllerName}/{action}.js
        if (controllerName && controllerActionName) {
            const actionAbsPath = path.join(basePath, moduleName, controllerName, `${controllerActionName}.js`);
            if (fs.existsSync(actionAbsPath)) {
                try {
                    const jsContent = fs.readFileSync(actionAbsPath, 'utf8');
                    jsContents.push(jsContent);
                } catch (err) {
                    console.error(`Error reading action JS (${moduleName}/${controllerName}/${controllerActionName}):`, err.message);
                }
            }
        }

        // Return all JS contents wrapped in a single <script> tag
        if (jsContents.length > 0) {
            return `<script>${jsContents.join('\n')}</script>`;
        }

        return '';
    }

    /**
     * Render module, controller, and action-specific JavaScript
     * Reads module, controller, and action names from Nunjucks context variables set by BaseController
     * @returns {string} HTML script tags with JavaScript content
     */
    render(...args) {
        // Extract Nunjucks context from arguments
        this._extractContext(args);

        // Get module, controller, and action names from context (set by BaseController in dispatch)
        const moduleName = this.getVariable('_moduleName');
        const controllerName = this.getVariable('_controllerName');
        const actionName = this.getVariable('_actionName');

        if (!moduleName) {
            return '';
        }

        return this.jsScriptTag(moduleName, controllerName, actionName);
    }
}

module.exports = OnDemandJsHelper;
