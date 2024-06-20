import react, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Papa from "papaparse";
import { FaEye } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";
import { flattenData } from "./utils/flattenData";
import { FaInfoCircle } from "react-icons/fa";

const block = document.querySelectorAll(".backlinks-explorer-update");

block.forEach(function (el) {
	ReactDOM.render(<BacklinksExplorer />, el);
	el.classList.remove("backlinks-explorer-update");
});

function BacklinksExplorer() {
	const [mode, setMode] = useState("1");
	const [subdomains, setSubdomains] = useState("1");
	const [includeIndirectLinks, setIncludeIndirectLinks] = useState("1");
	const [backlinkStatusType, setBacklinkStatusType] = useState("2");
	const [internalListLimit, setInternalListLimit] = useState("10");
	const [formData, setFormData] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [items, setItems] = useState([]);
	const [time, setTime] = useState(0);
	const [currentID, setCurrentID] = useState(0);
	const [download, setDownload] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [loadingResults, setLoadingResults] = useState(false);

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

	function handleSubmit(e) {
		e.preventDefault();
		setError(null);
		getResults({
			formData,
			mode,
			subdomains,
			includeIndirectLinks,
			backlinkStatusType,
			internalListLimit,
		});
	}

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
						request_type: "backlinks-explorer",
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
			const {
				formData,
				mode,
				subdomains,
				includeIndirectLinks,
				backlinkStatusType,
				internalListLimit,
			} = params;

			let subdomainsValue = false;
			let includeIndirectLinksValue = false;
			let backlinkStatusTypeValue = "all";
			let modeValue = "as_is";

			setError(null);
			setLoading(true);

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
			} else if (internalListLimit < 1 || internalListLimit > 1000) {
				setError("Internal List Limit must be between 1 and 1000");
				setLoading(false);
				return;
			} else if (mode < 1 || mode > 3) {
				setError("Mode must be between 1 and 3");
				setLoading(false);
				return;
			} else if (subdomains < 1 || subdomains > 2) {
				setError("Include Subdomains must be between 1 and 2");
				setLoading(false);
				return;
			} else if (includeIndirectLinks < 1 || includeIndirectLinks > 2) {
				setError("Include Indirect Links must be between 1 and 2");
				setLoading(false);
				return;
			} else if (backlinkStatusType < 1 || backlinkStatusType > 3) {
				setError("Backlink Status Type must be between 1 and 3");
				setLoading(false);
				return;
			}

			if (backlinkStatusType === "1") {
				backlinkStatusTypeValue = "all";
			} else if (backlinkStatusType === "2") {
				backlinkStatusTypeValue = "live";
			} else if (backlinkStatusType === "3") {
				backlinkStatusTypeValue = "lost";
			}

			if (subdomains === "1") {
				subdomainsValue = true;
			} else {
				subdomainsValue = false;
			}

			if (includeIndirectLinks === "1") {
				includeIndirectLinksValue = true;
			} else {
				includeIndirectLinksValue = false;
			}

			if (mode === "1") {
				modeValue = "as_is";
			} else if (mode === "2") {
				modeValue = "one_per_domain";
			} else if (mode === "3") {
				modeValue = "one_per_anchor";
			}

			const response = await axios.get(
				`${site_url.root_url}/wp-json/localwiz-enhancements/v3/backlinks-explorer?t=${formData.target}&is=${subdomainsValue}&iil=${includeIndirectLinksValue}&bst=${backlinkStatusTypeValue}&ill=${internalListLimit}&m=${modeValue}`,
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
								request_type: "backlinks-explorer",
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
								className="form-control"
								name="target"
								id="target"
								placeholder="ex. localdominator.co"
								onChange={(e) =>
									setFormData({ ...formData, target: e.target.value })
								}
								disabled={loading}
								value={formData.target}
								required
							/>
						</div>
					</div>
					<div className="row mb-3">
						<div className="col">
							<label for="mode" class="form-label">
								Mode:{" "}
								<span
									data-bs-toggle="tooltip"
									data-bs-placement="top"
									data-bs-title="Results grouping type."
								>
									<FaInfoCircle />
								</span>
							</label>
							<select
								className="form-select"
								aria-label="Default select example"
								id="mode"
								value={mode}
								onChange={(e) => setMode(e.target.value)}
								disabled={loading}
							>
								<option value="1">As Is</option>
								<option value="2">One Per Domain</option>
								<option value="3">One Per Anchor</option>
							</select>
						</div>
						<div className="col">
							<label for="includeSubdomains" class="form-label">
								Include Subdomains:{" "}
								<span
									data-bs-toggle="tooltip"
									data-bs-placement="top"
									data-bs-title="Indicates if the subdomains of the 'target' will be included in the search."
								>
									<FaInfoCircle />
								</span>
							</label>
							<select
								className="form-select"
								aria-label="Default select example"
								id="includeSubdomains"
								onChange={(e) => setSubdomains(e.target.value)}
								disabled={loading}
								value={subdomains}
							>
								<option value="1">Enable</option>
								<option value="2">Disable</option>
							</select>
						</div>
					</div>
					<div className="row mb-3">
						<div className="col">
							<label for="includeIndirectLinks" class="form-label">
								Include Indirect Links:{" "}
								<span
									data-bs-toggle="tooltip"
									data-bs-placement="top"
									data-bs-title="Indicates if indirect links to the 'target' will be included in the results."
								>
									<FaInfoCircle />
								</span>
							</label>
							<select
								className="form-select"
								aria-label="Default select example"
								id="includeIndirectLinks"
								onChange={(e) => setIncludeIndirectLinks(e.target.value)}
								disabled={loading}
								value={includeIndirectLinks}
							>
								<option value="1">Enable</option>
								<option value="2">Disable</option>
							</select>
						</div>
						<div className="col">
							<label for="backlinkStatusType" class="form-label">
								Backlink Status Type:{" "}
								<span
									data-bs-toggle="tooltip"
									data-bs-placement="top"
									data-bs-title="Set what backlinks to return and count."
								>
									<FaInfoCircle />
								</span>
							</label>
							<select
								className="form-select"
								id="backlinkStatusType"
								onChange={(e) => setBacklinkStatusType(e.target.value)}
								disabled={loading}
								value={backlinkStatusType}
							>
								<option value="1">All</option>
								<option value="2">Live</option>
								<option value="3">Lost</option>
							</select>
						</div>
					</div>
					<div className="row mb-3">
						<div className="col">
							<label for="internalListLimit" class="form-label">
								Internal List Limit:{" "}
								<span
									data-bs-toggle="tooltip"
									data-bs-placement="top"
									data-bs-title="Maximum number of elements within internal arrays."
								>
									<FaInfoCircle />
								</span>
							</label>
							<input
								type="number"
								class="form-control"
								id="internalListLimit"
								min="1"
								max="1000"
								value={internalListLimit}
								onChange={(e) => setInternalListLimit(e.target.value)}
								disabled={loading}
							/>
						</div>
						<div className="col"></div>
					</div>
					<div className="row mb-3">
						<div className="col">
							<button
								className="btn btn-success w-100"
								type="submit"
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
													href={`${site_url.root_url}/results/?id=${item.id}&type=backlinks-explorer`}
													className="btn btn-link"
													target="_blank"
													data-bs-toggle="tooltip"
													data-bs-placement="top"
													data-bs-title="View file in new tab"
												>
													<FaEye />
												</a>{" "}
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
			</div>
		</div>
	);
}
