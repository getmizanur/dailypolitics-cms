// application/helper/onDemandCssHelper.js
// View helper to load module-specific CSS on demand
const fs = require('fs');
const path = require('path');
const AbstractHelper = require(global.applicationPath('/library/mvc/view/helper/abstract-helper'));

class OnDemandCssHelper extends AbstractHelper {
    /**
     * Generate inline CSS or link tag for module-specific CSS
     * @param {string} moduleName - Module name
     * @returns {string} HTML style or link tag
     */
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

    /**
     * Render module-specific CSS
     * Reads module name from Nunjucks context variables set by BaseController
     * @returns {string} HTML style or link tag
     */
    render(...args) {
        // Extract Nunjucks context from arguments
        this._extractContext(args);

        // Get module name from context (set by BaseController in dispatch)
        const moduleName = this.getVariable('_moduleName');

        if (!moduleName) {
            return '';
        }

        return this.cssLinkTag(moduleName);
    }
}

module.exports = OnDemandCssHelper;
