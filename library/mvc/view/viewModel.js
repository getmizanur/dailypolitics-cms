
class ViewModel {
    constructor() {
        this.variables =  {};
        this.template = null;
    }

    getTemplate() {
        return this.template;
    }

    setTemplate(template) {
        this.template = template;

        return this;
    }

    getVariable(name, defaultValue = null) {
        if(this.variables && this.variables.hasOwnProperty(name)) {
            return this.variables[name];
        }

        return defaultValue;
    }

    getVariables() {
        return this.variables;
    }

    setVariable(name, value) {
        this.variables[name] = value;

        return this;
    }

    setVariables(variables) {
        for(let key in variables) {
            this.setVariable(key, variables[key]);
        }

        return this;
    }

    clearVariables() {
        this.variables = {};
    }
}

module.exports = ViewModel
