const BasePlugin = require('../basePlugin');
const StringUtil = require('../../../util/stringUtil');

class Layout extends BasePlugin {

    constructor(options = {}) {
        super(options);
    }

    getTemplate() {
        let request = super.getController().getRequest();
        let module = StringUtil.toSnakeCase(request.getModuleName()) || "default";
        let controller = StringUtil.toSnakeCase(request.getControllerName());
        let action = StringUtil.toSnakeCase(request.getActionName()).replace('-action', '');
        let dir = `application/${module}`;

        return dir + '/' + StringUtil.strReplace('_', '/', controller) 
            + '/' + action + '.njk'
    }

}

module.exports = Layout;
