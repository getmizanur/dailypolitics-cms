const Controller = require(global.applicationPath('/library/mvc/controller/baseController'));

class Index extends Controller {

    constructor(options = {}) {
        super(options);
    }

    indexAction() {
        return this.getView();
    }

}

module.exports = Index;