
class AbstractHelper {
    
    /**
     * Abstract render method that must be implemented by extending classes
     * @param {...any} args - Variable arguments passed to the render method
     * @throws {Error} If not implemented by extending class
     * @returns {string} Rendered output
     */
    render(...args) {
        throw new Error(`render() method must be implemented by ${this.constructor.name}`);
    }

}

module.exports = AbstractHelper;
