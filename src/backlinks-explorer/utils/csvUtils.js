import Papa from "papaparse";
import { flattenData } from "./flattenData";

export function fixCsvData(csvData) {
	let firstInstance = true;
	return csvData.map((csvItem) => {
		const newItem = {
			...csvItem,
			target: firstInstance ? csvItem.target : "",
		};
		firstInstance = false;
		return newItem;
	});
}

export function generateCsvUrls(fixedData) {
	return fixedData.map((item) => {
		const flattenedItem = flattenData(item);
		const csv = Papa.unparse(flattenedItem);
		const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		return [URL.createObjectURL(csvBlob)];
	});
}
