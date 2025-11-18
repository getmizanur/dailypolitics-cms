
class Input {

    constructor(name = null) { 
        this.name = name;
        this.required = true;
        this.validators = [];
        this.filters = [];
        this.errorMessages = [];
        this.value = null;
        this.rawValue = null;
        this.allowEmpty = false;
        this.hasValue = false;
        this.continueIfEmpty = false;

        this.prepareRequiredValidationFailureMessage = {
            NOT_EMPTY : 'Required, non-empty field'
        }
        
        // Allow custom required message
        this.customRequiredMessage = null;
    }

    getValidators() {
        return this.validators;
    }

    setValidators(validator) {
        this.validators.push(validator);
    }

    getFilters() {
        return this.filters;
    }

    setFilters(filter) {
        this.filters.push(filter);
    }

    setRequired(required) {
        this.required = required;
    }

    isRequired() {
        return !!this.required;
    }

    setAllowEmpty(allowEmpty) {
        this.allowEmpty = allowEmpty;
    }

    getAllowEmpty() {
        return this.allowEmpty;
    }

    setContinueIfEmpty(continueIfEmpty) {
        this.continueIfEmpty = continueIfEmpty;
    }

    getContinueIfEmpty() {
        return this.continueIfEmpty;
    }

    setValue(value) {
        this.clearValue();
        this.clearRawValue();

        this.value = value;
        // Only set hasValue to true if value is not null and not an empty string
        if (value !== null && value !== '') {
            this.hasValue = true;
        }
        if (this.value != null && this.rawValue == null) {
            this.setRawValue(value);
        }
    }

    getValue() {
        return this.value;
    }

    setRawValue(value) {
        this.rawValue = value;
    }

    getRawValue() {
        return this.rawValue;
    }

    clearValue() {
        this.hasValue = false;
        this.value = null;
    }

    clearRawValue() {
        this.rawValue = null;
    }

    getHasValue() {
        return this.hasValue;
    }

    isValid(context = null) {
        let value = this.getValue();
        let hasValue = this.getHasValue();
        let empty = (value === null || value === '');  
        let required = this.isRequired();
        let allowEmpty = this.getAllowEmpty();
        let continueIfEmpty = this.getContinueIfEmpty();
        let inputContext = context;
        
        if(!hasValue && !required) {
            return true;
        }

        if(!hasValue && required) {
			/* istanbul ignore next */
            if(this.errorMessages.length === 0) {
                // Use custom message if set, otherwise use default
                const message = this.customRequiredMessage || 
                    this.prepareRequiredValidationFailureMessage.NOT_EMPTY;
                this.setErrorMessage(message);
            }
            return false;
        }

        if(empty && !required && !continueIfEmpty) {
            return true;
        }

        if(empty && allowEmpty && !continueIfEmpty) {
            return true;
        }

        let result = true;
        const validators = this.getValidators();
        validators.forEach((validator) => {
            let valid = validator.isValid(this.getValue(), inputContext);
            if(!valid) {
                this.setErrorMessage(validator.message);
                result = false;
            }
        });

        return result;
    }

    setErrorMessage(message) {
        this.errorMessages.push(message);
    }

    getMessages() {
        return this.errorMessages;
    }

    getName() {
        return this.name;
    }
    
    /**
     * Set custom required field message
     * @param {string} message 
     */
    setRequiredMessage(message) {
        this.customRequiredMessage = message;
        return this;
    }
}

module.exports = Input
