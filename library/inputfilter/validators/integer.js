const AbstractValidator = require('./abstractValidator');

class Integer extends AbstractValidator {

    constructor(options = {}) {
        super();
        this.name = options.name || 'input'
        this.max = options.max || null;
        this.min = options.min || null;

        this.message = null;
        this.messageTemplate = {
            NOT_INT : `The ${this.name} does not appear to be an integer`,
            NOT_LESS : `The ${this.name} is not less than '${this.max}'`,
            NOT_GREATER : `The ${this.name} is not greater than '${this.min}'`,
        };
    }

    getMin() {
        return this.min;
    }

    setMin(min) {
        if(this.getMax() != null && min > this.getMax()) {
            throw new Error(
                `The minimum must be less than or equal to the maximum value, but ${min} > ${this.getMax()}`
            );
        }

        this.min = min;
    }

    getMax() {
        return this.max;
    }

    setMax(max) {
        if(max < this.getMin()) {
            throw new Error(
                `The maximum must be greater than or equal to the minimum value, but ${max} < ${this.getMin()}`
            );
        }

        this.max = max;
    }

    isValid(value) {
        if(!Number.isInteger(parseInt(value))) {
            this.message = this.messageTemplate.NOT_INT;
            return false;
        }

        if(this.min) {
            this.setMin(this.min);
        }

        if(this.max) {
            this.setMax(this.max);
        }

        if(this.min &&  value < this.min) {
            this.message = this.messageTemplate.NOT_GREATER;
            return false;
        }

        if(this.max && value > this.max) {
            this.message = this.messageTemplate.NOT_LESS;
            return false;
        }

        return true;
    }

}

module.exports = Integer
