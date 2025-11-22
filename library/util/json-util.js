

class JsonUtil {

	/*
	const obj1 = { a: 1, b: { x: 10, y: 20 } };
	const obj2 = { b: { y: 30, z: 40 }, c: 3 };

	const merged = deepMerge({}, obj1);
	deepMerge(merged, obj2);

	console.log(merged); // Output: { a: 1, b: { x: 10, y: 30, z: 40 }, c: 3 }
	*/
	static merge(target, source) {
		for (let key in source) {
			if (source[key] && typeof source[key] === 'object') {
				if (!target[key] || typeof target[key] !== 'object') {
					target[key] = {};
				}
				JsonUtil.merge(target[key], source[key]);
			} else {
				target[key] = source[key];
			}
		}
		return target;
	}


}

module.exports = JsonUtil
