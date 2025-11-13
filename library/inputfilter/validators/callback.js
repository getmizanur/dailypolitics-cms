
class Callback {

    constructor(options = {}) {
        this.callback = options.callback;
        this.message = options.message; 
    }

    isValid(value) {
        return this.callback(value); 
    }

    getClass() {
        return this.constructor.name;
    }

}

module.exports = Callback
