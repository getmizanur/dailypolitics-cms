
class Container {

    constructor(namespace) {
        if(global.locals === undefined) {
            global.locals = {};
        }

        this.namespace = namespace;

        if(!global.locals.hasOwnProperty(this.namespace)) {
            global.locals[this.namespace] = {
                initialized: true
            }
        }

        console.log(global.locals);
    }

    getNamespace() {
        return this.namespace;
    }

    has(name) {
        return global.locals[this.namespace] && global.locals[this.namespace].hasOwnProperty(name);
    }

    get(name, defaultValue = null) {
        if(!global.locals[this.namespace].hasOwnProperty(name)) {
            if (defaultValue !== null) {
                return defaultValue;
            }
            throw Error(`No entry is registered for key ${name}`);
        }

        return global.locals[this.namespace][name];
    }

    set(name, value) {
        global.locals[this.namespace][name] = value;

        return this;
    }

	all() {
        if(!global.locals[this.namespace].hasOwnProperty('initialized')) {
            throw Error(`No entry is registered for key ${index}`);
        }

        return global.locals[this.namespace]
    }

    isInitialized() {
        return global.locals[this.namespace].initialized;
    }

}

module.exports = Container;
