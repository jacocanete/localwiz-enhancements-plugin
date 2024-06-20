import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Papa from "papaparse";
import { FaEye } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";
import locations from "./utils/locations";
import { flattenData } from "./utils/flattenData";
import { FaInfoCircle } from "react-icons/fa";

const block = document.querySelectorAll(".ranked-keywords-update");

block.forEach(function (el) {
	ReactDOM.render(<RankedKeywords />, el);
	el.classList.remove("ranked-keywords-update");
});

function RankedKeywords() {
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
	const [availableLanguages, setAvailableLanguages] = useState([]);
	const [location, setLocation] = useState(2840);
	const [language, setLanguage] = useState("en");
	const [historicalSerpMode, setHistoricalSerpMode] = useState("live");
	const allLanguages = locations;

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

	useEffect(() => {
		if (location) {
			const locationLanguages = allLanguages.find(
				(loc) => loc.location_code === location,
			);
			setAvailableLanguages(
				locationLanguages ? locationLanguages.available_languages : [],
			);
			setLanguage(locationLanguages.available_languages[0].language_code);
		}
	}, [location, allLanguages]);

	async function getSavedResults() {
		try {
			const response = await axios.get(
				`${site_url.root_url}/wp-json/localwiz-enhancements/v1/get-csv`,
				{
					headers: {
						"X-WP-Nonce": site_url.nonce,
					},
					params: {
						request_type: "ranked-keywords",
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

	async function getResults(params) {
		try {
			setResults(null);
			setError(null);
			setLoading(true);

			const { formData, location, historicalSerpMode } = params;

			const urlPattern = new RegExp(
				"^((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,})$", // domain name and extension
				"i",
			);

			if (
				!formData.target ||
				formData.target === "" ||
				!urlPattern.test(formData.target)
			) {
				setError("Please enter a target URL without 'https://' or 'www.'");
				setLoading(false);
				return;
			}

			const response = await axios.get(
				`${site_url.root_url}/wp-json/localwiz-enhancements/v2/ranked-keywords?t=${formData.target}&loc=${location}&hsm=${historicalSerpMode}&lang=${language}`,
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

				if (!data || !data.items || data.items.length === 0) {
					setError(
						"Task executed successfully but no data was found, please check target URL and try again.",
					);
					setLoading(false);
					return;
				}

				const items = data.items;

				let firstInstance = true;

				if (!items || items.length === 0) {
					setError(
						"Task executed successfully but no data was found, please check target URL and try again.",
					);
					setLoading(false);
					return;
				}

				const csvData = items.map((item) => {
					const newItem = {
						target: firstInstance ? formData.target : "",
						...item,
					};
					firstInstance = false;
					return newItem;
				});

				let flatData = flattenData(csvData);

				let csv = Papa.unparse(flatData);

				let csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

				let csvUrl = URL.createObjectURL(csvBlob);

				let date = new Date();
				let formattedDate = `${date.getFullYear()}-${
					date.getMonth() + 1
				}-${date.getDate()}`;

				let url = new URL(`https://${formData.target}`);
				let formattedHostName = url.hostname.replace("www.", "");

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
								request_type: "ranked-keywords",
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

				setTime(parseFloat(data.execution_time).toFixed(4));
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

	function handleSubmit(e) {
		e.preventDefault();
		setError(null);
		getResults({ formData, location, language, historicalSerpMode });
	}

	return (
		<div className="container mb-5">
			<div className="p-4 border shadow inner">
				<form onSubmit={handleSubmit}>
					<div className="row mb-3">
						<div className="col">
							<label for="target" class="form-label">
								Target:{" "}
								<span
									data-bs-toggle="tooltip"
									data-bs-placement="top"
									data-bs-title="The domain name of the target website. The domain should be specified without 'https://' and 'www.'"
								>
									<FaInfoCircle />
								</span>
							</label>
							<input
								type="text"
								name="target"
								id="target"
								className="form-control"
								placeholder="ex. localdominator.co"
								onChange={handleChange}
								disabled={loading}
								required
							/>
						</div>
					</div>
					<div className="row mb-3">
						<div className="col">
							<label for="location" class="form-label">
								Location:{" "}
								<span
									data-bs-toggle="tooltip"
									data-bs-placement="top"
									data-bs-title="Search engine location."
								>
									<FaInfoCircle />
								</span>
							</label>
							<select
								className="form-select"
								id="location"
								value={location}
								onChange={(e) => {
									setLocation(+e.target.value);
								}}
								disabled={loading}
							>
								{allLanguages.map((loc) => (
									<option value={loc.location_code}>{loc.location_name}</option>
								))}
							</select>
						</div>
						<div className="col">
							<label for="language" class="form-label">
								Language:{" "}
								<span
									data-bs-toggle="tooltip"
									data-bs-placement="top"
									data-bs-title="Search engine language."
								>
									<FaInfoCircle />
								</span>
							</label>
							<select
								className="form-select"
								id="language"
								onChange={(e) => {
									setLanguage(e.target.value);
								}}
								disabled={loading}
							>
								{availableLanguages.map((lang) => (
									<option value={lang.language_code}>
										{lang.language_name}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className="row mb-3">
						<div className="col">
							<label for="historicalSerpMode" class="form-label">
								Historical SERP Mode:{" "}
								<span
									data-bs-toggle="tooltip"
									data-bs-placement="top"
									data-bs-title="'live' — return keywords for which the specified target currently has ranking results in SERP; 'lost' — return keywords for which the specified target had previously had ranking results in SERP, but didn’t have them during the last check; 'all' — return both types of keywords."
								>
									<FaInfoCircle />
								</span>
							</label>
							<select
								className="form-select"
								id="historicalSerpMode"
								onChange={(e) => {
									setHistoricalSerpMode(e.target.value);
								}}
								disabled={loading}
							>
								<option value="live">Live</option>
								<option value="lost">Lost</option>
								<option value="all">All</option>
							</select>
						</div>
						<div className="col"></div>
					</div>
					<div className="row mb-3">
						<div className="col">
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
													href={`${site_url.root_url}/results/?id=${item.id}&type=ranked-keywords`}
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
