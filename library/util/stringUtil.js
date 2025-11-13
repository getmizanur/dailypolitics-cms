
class StringUtil {

    static lcfirst(str) {
        str += '';
        let f = str.charAt(0)
            .toLowerCase();
        return f + str.substr(1); 
    }

    static ucfirst(str) {
        str += '';
        let f = str.charAt(0)
            .toUpperCase();
        return f + str.substr(1);
    }

	static ucwords(str) {
	  return (str + '')
		.replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
		  return $1.toUpperCase();
		});
	}

    static toCamelCase(str) {
        return str.toLowerCase().replace(/([-_][a-z])/g, group =>
            group
              .toUpperCase()
              .replace('-', '')
              .replace('_', '')
          );
    }

    static toSnakeCase(str){
    	return str.split('').map((character) => {
			if (character == character.toUpperCase()) {
				return '-' + character.toLowerCase();
			} else {
				return character;
			}
		}).join(''); 
    }

    static strtolower(str) {
        return (str + '').toLowerCase();
    }

    static strtoupper(str) {
        return (str + '').toUpperCase();
    }

    static split(delimiter, string) {
        return string.split(delimiter);
    }

    static strReplace(search, replace, subject) {
        return subject.replace(search, replace);
    }

}

module.exports = StringUtil
