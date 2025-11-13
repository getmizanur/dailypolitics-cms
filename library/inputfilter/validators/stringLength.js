
class StringLength {

    constructor(options = {}) {
        this.name = options.name || 'input';
        this.min = options.min || null;
        this.max = options.max || null;
        this.length = null;

        this.message = null;
        this.messageTemplate = options.messageTemplate || {
            INVALID_FORMAT : `The ${this.name} is not a valid AlphaNumeric string`,
            INVALID_TOO_SHORT : `The ${this.name} is less than ${this.min} characters long`,
            INVALID_TOO_LONG : `The ${this.name} is more than ${this.min} characters long`
        };
    }

    getMin() {
        return this.min;
    }

    setMin(min) {
        if(this.getMax() != null && min > this.getMax()) {
            throw new Error(
                `The minimum must be less than or equal to the maximum length, but ${min} > ${this.getMax()}`
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
                `The maximum must be greater than or equal to the minimum length, but ${max} < ${this.getMin()}`
            );
        }

        this.max = max;
    }

    getLength() {
        return this.length;
    }

    setLength(length) {
        this.length = length;
    }

    isValid(value) {

        this.setLength(value.length);

        if(this.getLength() < this.getMin()) {
            this.message = this.messageTemplate.INVALID_TOO_SHORT;
            return false;
        }

        if(this.getLength() > this.getMax()) {
            this.message = this.messageTemplate.INVALID_TOO_LONG;
            return false;
        }

        return true;

    }

    getClass() {
        return this.constructor.name;
    }
    
}

module.exports = StringLength 
