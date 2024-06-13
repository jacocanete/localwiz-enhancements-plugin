import React, { useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Papa from "papaparse";
import { FaEye } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";

const block = document.querySelectorAll(".citation-finder-update");

block.forEach(function (el) {
	ReactDOM.render(<CitationFinder />, el);
	el.classList.remove("citation-finder-update");
});

function CitationFinder() {
	const [formData, setFormData] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [results, setResults] = useState(null);
	const [filename, setFilename] = useState("");
	const [viewTable, setViewTable] = useState(false);
	const [items, setItems] = useState([]);
	const [time, setTime] = useState(0);

	const tooltipTriggerList = [].slice.call(
		document.querySelectorAll("#tooltipButton"),
	);
	const tooltipList = [...tooltipTriggerList].map(
		(tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl),
	);

	async function getResults(keyword) {
		try {
			setViewTable(false);
			setResults(null);
			setError(null);
			setLoading(true);

			if (!keyword || keyword === "") {
				setError("Please enter a keyword");
				setLoading(false);
				return;
			}

			const response = await axios.get(
				`${site_url.root_url}/wp-json/localwiz-enhancements/v1/citation-finder?kw=${keyword}`,
				{
					headers: {
						"X-WP-Nonce": site_url.nonce,
					},
				},
			);

			if (!response.statusText === "OK") {
				setError("Error fetching data");
				setLoading(false);
				return;
			} else {
				const data = response.data;
				const items = data.tasks[0].result[0].items;
				const csvData = items.map((item, index) => ({
					Keyword: index === 0 ? formData.keyword : "",
					URL: item.url ? item.url : "No url found",
				}));

				let csv = Papa.unparse(csvData);

				let csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

				let csvUrl = URL.createObjectURL(csvBlob);

				let date = new Date();
				let formattedDate = `${date.getFullYear()}-${
					date.getMonth() + 1
				}-${date.getDate()}`;

				setFilename(`${formattedDate} ${formData.keyword}.csv`);
				setTime(parseFloat(data.time));
				setItems(csvData);
				setResults(csvUrl);
				setLoading(false);
			}
		} catch (e) {
			setError(`Unable to fetch data: ${e.message}`);
			setLoading(false);
		}
	}

	function handleChange(e) {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	}

	function handleSubmit(e) {
		e.preventDefault();
		getResults(formData.keyword);
	}

	return (
		<div className="container mb-5">
			<div className="p-4 border shadow inner">
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label class="form-label">Enter keyword here</label>
						<input
							type="text"
							name="keyword"
							className="form-control"
							placeholder="ex. Weather control"
							onChange={handleChange}
							disabled={loading}
						/>
					</div>
					<div className="mb-3">
						<button
							type="submit"
							className="btn btn-success w-100"
							disabled={loading}
						>
							{loading ? (
								<span
									className="spinner-border spinner-border-sm"
									role="status"
									aria-hidden="true"
								></span>
							) : (
								"Submit"
							)}
						</button>
					</div>
				</form>
				{error && <div className="alert alert-danger">{error}</div>}
				{results && (
					<>
						<span>
							This task took <strong>{time}</strong>{" "}
							{time === 1 ? "second" : "seconds"} to complete.
						</span>
						<hr />
						<div className="mt-3 d-flex flex-row justify-content-center align-items-center">
							<span>{filename}</span>
							<a
								href={results}
								download={filename}
								className="btn btn-link"
								data-bs-placement="top"
								data-bs-title="Download CSV"
								id="tooltipButton"
							>
								<FaDownload />
							</a>
							<br />
							<button
								className="btn btn-link"
								// onClick={(e) => {
								// 	e.preventDefault();
								// 	if (viewTable) {
								// 		setViewTable(false);
								// 	} else {
								// 		setViewTable(true);
								// 	}
								// }}
								data-bs-toggle="collapse"
								data-bs-target="#urlCollapse"
								aria-expanded="false"
								aria-controls="urlCollapse"
								data-bs-placement="top"
								data-bs-title="Preview CSV"
								id="tooltipButton"
							>
								<FaEye />
							</button>
						</div>
					</>
				)}
				<div className="container collapse table-responsive" id="urlCollapse">
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
				</div>
			</div>
		</div>
	);
}
