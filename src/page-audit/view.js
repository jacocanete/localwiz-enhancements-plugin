import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Papa from "papaparse";
import { FaEye } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";
import { FaInfoCircle } from "react-icons/fa";
import { flattenData } from "./utils/flattenData";
import { isValidUrl } from "./utils/isValidUrl";

const block = document.querySelectorAll(".instant-pages-update");

block.forEach(function (el) {
	ReactDOM.render(<InstantPages />, el);
	el.classList.remove("instant-pages-update");
});

function InstantPages() {
	const [formData, setFormData] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [results, setResults] = useState(null);
	const [filename, setFilename] = useState("");
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
		setSubmitting(true);
		await getSavedResults();
		setSubmitting(false);
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
						request_type: "instant-pages",
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

	async function getResults(url) {
		try {
			setResults(null);
			setError(null);
			setLoading(true);

			if (!isValidUrl(url)) {
				setError(
					"Please enter a valid URL. Make sure to include http:// or https://",
				);
				setLoading(false);
				return;
			}

			const response = await axios.get(
				`${site_url.root_url}/wp-json/localwiz-enhancements/v1/instant-pages?url=${url}`,
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

				console.log(data);

				if (data.tasks[0].result === null) {
					setError(
						"Task executed successfully but no data was found, please check target URL and try again.",
					);
					setLoading(false);
					return;
				}

				const items = data.tasks[0].result[0].items;

				let firstInstance = true;

				if (!items || items.length === 0) {
					setError(
						"Task executed successfully but no data was found, please check target URL and try again.",
					);
					setLoading(false);
					return;
				}

				const csvData = items.map((item, index) => ({
					url: firstInstance ? formData.url : "",
					broken_resources: item.broken_resources,
					broken_links: item.broken_links,
					duplicate_title: item.duplicate_title,
					duplicate_description: item.duplicate_description,
					duplicate_content: item.duplicate_content,
					...item.checks,
				}));

				let flatData = flattenData(csvData);

				let csv = Papa.unparse(flatData);

				console.log(`CSV: ${csv}`);

				let csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

				let csvUrl = URL.createObjectURL(csvBlob);

				let date = new Date();
				let formattedDate = `${date.getFullYear()}-${
					date.getMonth() + 1
				}-${date.getDate()}`;

				let url = new URL(`${formData.url}`);
				let formattedHostName =
					url.hostname.replace("www.", "") + url.pathname.replace(/\//g, "-");

				let reader = new FileReader();
				reader.readAsDataURL(csvBlob);
				reader.onloadend = function () {
					let base64data = reader.result.split(",")[1]; // Remove the data URL prefix

					axios
						.post(
							`${site_url.root_url}/wp-json/localwiz-enhancements/v1/upload-csv`,
							{
								csv_data: base64data,
								file_name: `${formattedDate}-${formattedHostName}`,
								cost: data.cost,
								request_type: "instant-pages",
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
		getResults(formData.url);
	}

	return (
		<div className="container mb-5">
			<div className="p-4 border shadow inner">
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label class="form-label">
							URL:{" "}
							<span
								data-bs-toggle="tooltip"
								data-bs-placement="top"
								data-bs-title="Absolute URL of the target page."
							>
								<FaInfoCircle />
							</span>
						</label>
						<input
							type="text"
							name="url"
							className="form-control"
							placeholder="ex. https://localdominator.co/blog"
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
													href={`${site_url.root_url}/results/?id=${item.id}&type=instant-pages`}
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
				) : !submitting && items && items.length === 0 ? (
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
			</div>
		</div>
	);
}
