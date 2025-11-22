
class VarUtil {

    static isNull(val) {
        return (val === null);
    }

    static isObject(val) {
        return typeof val === 'object' && val !== null;
    }

    static isBool(val) {
        return (val === true || val === false);
    }

    static isString(val) {
        return (typeof val === 'string');
    }

    static isInt(mixed_var) {
        return mixed_var === +mixed_var && isFinite(mixed_var) && !(mixed_var % 1);
    }

    static isset() {
        let a = arguments,
            l = a.length,
            i = 0,
            undef;

        if (l === 0) {
            throw new Error('Empty isset');
        }

        while (i !== l) {
            if (a[i] === undef || a[i] === null) {
                return false;
            }
            i++;
        }
        return true;
    }

    static empty(val) {
        let undef, key, i, len;
        let emptyValues = [undef, null, false, 0, '', '0'];

        for (i = 0, len = emptyValues.length; i < len; i++) {
            if (val === emptyValues[i]) {
                return true;
            }
        }

        if (typeof val === 'object') {
            for(key in val) {
                return false;
            }

            return true;
        }

        return false;
    }

    static isJSON(val) {
        if(typeof val === 'string') {
            try {
                JSON.parse(val)
                return true;
            }catch(e) {}
        }

        return false;
    }

	static isArray(mixed_var) {
	 	return Array.isArray(mixed_var); 
	}

}

module.exports = VarUtil
