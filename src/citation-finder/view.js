import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Papa from "papaparse";
import { FaEye } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";
import { FaInfoCircle } from "react-icons/fa";

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
	const [currentID, setCurrentID] = useState(0);
	const [credits, setCredits] = useState(0);
	const [submitting, setSubmitting] = useState(false);

	const tooltipTriggerList = document.querySelectorAll(
		'[data-bs-toggle="tooltip"]',
	);
	const tooltipList = [...tooltipTriggerList].map(
		(tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl),
	);

	useEffect(async () => {
		setLoading(true);
		await getSavedResults();
		setLoading(false);
	}, []);

	async function getSavedResults() {
		try {
			setLoading(true);
			const response = await axios.get(
				`${site_url.root_url}/wp-json/localwiz-enhancements/v1/get-csv`,
				{
					headers: {
						"X-WP-Nonce": site_url.nonce,
					},
					params: {
						request_type: "citation-finder",
					},
				},
			);

			if (!response.statusText === "OK") {
				setError(`Unable to fetch saved results: ${error.message}`);
				setLoading(false);
				return;
			} else {
				const data = response.data;
				const items = data.data;
				setItems(items);
				if (items.length > 0) {
					setCurrentID(items[0].id);
				}
			}

			setLoading(false);
			setError(null);
		} catch (error) {
			setError(`Unable to fetch saved results: ${error.message}`);
			setLoading(false);
		}
	}

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

				let reader = new FileReader();
				reader.readAsDataURL(csvBlob);
				reader.onloadend = function () {
					let base64data = reader.result.split(",")[1]; // Remove the data URL prefix

					axios
						.post(
							`${site_url.root_url}/wp-json/localwiz-enhancements/v1/upload-csv`,
							{
								csv_data: base64data,
								file_name: `${formattedDate}-${formData.keyword}`,
								cost: data.cost,
								request_type: "citation-finder",
							},
							{
								headers: {
									"X-WP-Nonce": site_url.nonce,
									"Content-Type": "application/json",
								},
							},
						)
						.then((response) => {
							getSavedResults();
							setSubmitting(true);
						})
						.catch((error) => {
							setError("Error uploading file:", error.response.data);
						});
				};

				setTime(parseFloat(data.time));
			}
		} catch (e) {
			if (e.response.data.code === "balance_error") {
				setError("Insufficient credits to complete this task.");
				setLoading(false);
				return;
			}
			setError(`Unable to fetch data: ${e.message}`);
			console.log(e);
			setLoading(false);
		}
	}

	function handleChange(e) {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	}

	async function handleSubmit(e) {
		e.preventDefault();
		getResults(formData.keyword);
	}

	return (
		<div className="container mb-5">
			<div className="p-4 border shadow inner">
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label class="form-label">
							Keywords:{" "}
							<span
								data-bs-toggle="tooltip"
								data-bs-placement="top"
								data-bs-title="You can specify up to 1000 keywords by using comma as a delimeter."
							>
								<FaInfoCircle />
							</span>
						</label>
						<input
							type="text"
							name="keyword"
							className="form-control"
							placeholder="ex. Weather control"
							onChange={handleChange}
							disabled={loading}
							required
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
				{items && items.length > 0 ? (
					<>
						{submitting && !loading && (
							<span>
								This task took <strong>{time}</strong>{" "}
								{time === 1 ? "second" : "seconds"} to complete.
							</span>
						)}
						<hr className="mb-2" />
						<div className="table-responsive">
							<table className="table table-striped table-hover mt-3 caption-top">
								<caption>Download the CSV for a better view.</caption>
								<thead className="table-dark">
									<tr>
										<th>File Name</th>
										<th>Download</th>
										<th>View</th>
									</tr>
								</thead>
								<tbody>
									{items.map((item, index) => (
										<tr>
											<td className="text-truncate">
												{item.id === currentID && submitting && !loading ? (
													<>
														{item.file_name}
														<span
															className="badge text-bg-success"
															style={{ marginLeft: "0.5rem" }}
														>
															New
														</span>
													</>
												) : (
													item.file_name
												)}
											</td>
											<td className="text-truncate">
												<a
													href={item.csv_url}
													className="btn btn-link"
													download={item.file_name}
													data-bs-toggle="tooltip"
													data-bs-placement="top"
													data-bs-title="Download csv"
												>
													<FaDownload />
												</a>
											</td>
											<td className="text-truncate">
												<a
													href={`${site_url.root_url}/results/?id=${item.id}&type=citation-finder`}
													className="btn btn-link"
													target="_blank"
													data-bs-toggle="tooltip"
													data-bs-placement="top"
													data-bs-title="View file in new tab"
												>
													<FaEye />
												</a>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</>
				) : !loading && items && items.length === 0 ? (
					<div className="alert alert-info">No saved results found.</div>
				) : (
					<div className="d-flex align-items-center gap-2">
						<span
							className="spinner-border spinner-border-sm"
							role="status"
							aria-hidden="true"
						></span>
						Loading saved results...
					</div>
				)}
				{/* <div className="container collapse table-responsive" id="urlCollapse">
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
				</div> */}
			</div>
		</div>
	);
}
