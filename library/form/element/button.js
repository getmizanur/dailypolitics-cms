const Element = require('../element');
const StrUtil = require('../../util/stringUtil');

class Button extends Element {
    
    constructor(name = null) {
        super();

        this.setName(name);
        this.setValue(StrUtil.ucfirst(name));
        this.setAttribute('type', 'button');
    }

}

module.exports = Button;
