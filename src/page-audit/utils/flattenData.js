function flattenObject(ob) {
	const toReturn = {};

	for (const [i, value] of Object.entries(ob)) {
		if (typeof value == "object" && value !== null) {
			const flatObject = flattenObject(value);
			for (const [x, flatValue] of Object.entries(flatObject)) {
				toReturn[`${i}.${x}`] = flatValue;
			}
		} else {
			if (typeof value === "boolean") {
				toReturn[i] = value ? "Yes" : "No";
			} else {
				toReturn[i] = value;
			}
		}
	}
	return toReturn;
}

export function flattenData(data) {
	const result = [];
	for (const item of data) {
		try {
			result.push(flattenObject(item));
		} catch (error) {
			console.error(`Error flattening object: ${error}`);
		}
	}
	return result;
}
