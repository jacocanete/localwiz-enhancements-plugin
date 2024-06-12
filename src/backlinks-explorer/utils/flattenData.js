export function flattenData(data) {
	return data.map((item) => {
		let newItem = {};
		for (let key in item) {
			if (typeof item[key] === "object") {
				newItem[key] = JSON.stringify(item[key]);
			} else {
				newItem[key] = item[key];
			}
		}
		return newItem;
	});
}
