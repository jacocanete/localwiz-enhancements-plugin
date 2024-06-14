import react, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Papa from "papaparse";

const block = document.querySelectorAll(".results-update");

block.forEach(function (el) {
	ReactDOM.render(<Results />, el);
	el.classList.remove("results-update");
});

function Results() {
	const [params, setParams] = useState({});
	const [result, setResult] = useState({});
	const [error, setError] = useState("");
	const [tableData, setTableData] = useState([]);

	useEffect(() => {
		const params = getURLParams();
		setParams(params);

		const getResults = async () => {
			try {
				setError("");
				const { type, id } = params;
				console.log(type, id);
				const response = await axios.get(
					`${site_url.root_url}/wp-json/localwiz-enhancements/v1/get-csv`,
					{
						headers: {
							"X-WP-Nonce": site_url.nonce,
						},
						params: {
							request_type: type,
							id: id,
						},
					},
				);

				if (!response.statusText === "OK") {
					setError(`Unable to fetch saved results: ${error.message}`);
					return;
				} else {
					const data = response.data;
					const result = data.data[0];
					setResult(result);
					const parsedResult = Papa.parse(result.csv_url, {
						download: true,
						header: true,
						complete: function (results) {
							console.log("Parsing complete:", results.data);
							setTableData(results.data);
						},
						error: function (error) {
							setError(`Unable to parse saved results: ${error.message}`);
						},
					});
				}
			} catch (error) {
				setError(`Unable to fetch saved results: Unauthorized access`);
			}
		};

		getResults();
	}, []);

	return (
		<div className="container mb-4">
			<div className="p-4 border shadow inner">
				{error && (
					<div className="alert alert-danger" role="alert">
						{error}
					</div>
				)}
				<div className="row table-responsive">
					<table className="table table-striped table-hover">
						<thead className="table-dark">
							<tr>
								{tableData.length > 0 &&
									Object.keys(tableData[0]).map((key, index) => (
										<th key={index}>{key}</th>
									))}
							</tr>
						</thead>
						<tbody>
							{tableData.map((item, index) => (
								<tr key={index}>
									{Object.values(item).map((value, i) => (
										<td key={i} className="text-truncate">
											{typeof value === "string" && value.startsWith("http") ? (
												<a href={value} target="_blank" rel="noreferrer">
													{value}
												</a>
											) : typeof value === "boolean" ? (
												value.toString()
											) : typeof value === "object" ? (
												JSON.stringify(value)
											) : (
												value
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

function getURLParams() {
	const params = new URLSearchParams(window.location.search);
	return Array.from(params.entries()).reduce(
		(obj, [key, value]) => ({ ...obj, [key]: value }),
		{},
	);
}

{
	/*
					<table className="table table-striped table-hover mt-3 caption-top">
						<caption>Download the CSV for a better view.</caption>
						<thead className="table-dark">
							<tr>
								{items[0] &&
									Object.keys(items[0]).map((key, index) => (
										<th key={index}>{key}</th>
									))}
							</tr>
						</thead>
						<tbody>
							{items.map((item, index) => (
								<tr key={index}>
									{Object.values(item).map((value, i) => (
										<td key={i} className="text-truncate">
											{typeof value === "string" && value.startsWith("http") ? (
												<a href={value} target="_blank" rel="noreferrer">
													{value}
												</a>
											) : typeof value === "boolean" ? (
												value.toString()
											) : typeof value === "object" ? (
												JSON.stringify(value)
											) : (
												value
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
 	*/
}
