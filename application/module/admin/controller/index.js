const Controller = require(global.applicationPath('/library/controller/baseController'));

class Index extends Controller {

    constructor(options = {}) {
        super(options);
    }

    indexAction() {
        return this.getView();
    }

}

module.exports = Index;