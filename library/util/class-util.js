
class ClassUtil {

    static getParentClass(targetClass) {
        if(targetClass instanceof Function){
            let baseClass = targetClass;

            while (baseClass){
                const newBaseClass = Object.getPrototypeOf(baseClass);

                if(newBaseClass && newBaseClass !== Object && newBaseClass.name){
                    baseClass = newBaseClass;
                }else{
                    break;
                }
            }

            return baseClass;

        }
    }

    static getClassMethods(obj) {
		let props = []

		do {
			const l = Object.getOwnPropertyNames(obj)
				.concat(Object.getOwnPropertySymbols(obj).map(s => s.toString()))
				//.sort()
				.filter((p, i, arr) =>
					typeof obj[p] === 'function' &&  //only the methods
					p !== 'constructor' &&           //not the constructor
					(i == 0 || p !== arr[i - 1]) &&  //not overriding in this prototype
					props.indexOf(p) === -1          //not overridden in a child
				)
			props = props.concat(l)
		}while (
			(obj = Object.getPrototypeOf(obj)) && Object.getPrototypeOf(obj)
		)

		return props
	}

}

module.exports = ClassUtil
