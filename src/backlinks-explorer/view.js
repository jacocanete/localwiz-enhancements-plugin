import react, { useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Papa from "papaparse";
import { FaEye } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";
import { flattenData } from "./utils/flattenData";

const block = document.querySelectorAll(".backlinks-explorer-update");

block.forEach(function (el) {
	ReactDOM.render(<BacklinksExplorer />, el);
	el.classList.remove("backlinks-explorer-update");
});

function BacklinksExplorer() {
	const [mode, setMode] = useState("1");
	const [subdomains, setSubdomains] = useState("1");
	const [includeIndirectLinks, setIncludeIndirectLinks] = useState("1");
	const [backlinkStatusType, setBacklinkStatusType] = useState("1");
	const [internalListLimit, setInternalListLimit] = useState("10");
	const [formData, setFormData] = useState({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [results, setResults] = useState(null);
	const [filename, setFilename] = useState("");
	const [viewTable, setViewTable] = useState(false);
	const [items, setItems] = useState([]);
	const [time, setTime] = useState(0);

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

	// console.log({
	// 	formData,
	// 	mode,
	// 	subdomains,
	// 	includeIndirectLinks,
	// 	backlinkStatusType,
	// 	internalListLimit,
	// });

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
				"^(https?:\\/\\/)?" + // protocol
					"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name and extension
					"((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
					"(\\:\\d+)?" + // port
					"(\\/[-a-z\\d%_.~+]*)*" + // path
					"(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
					"(\\#[-a-z\\d_]*)?$",
				"i",
			); // fragment locator

			if (
				!formData.target ||
				formData.target === "" ||
				!urlPattern.test(formData.target)
			) {
				setError(
					"Invalid input. Please enter a valid URL including the http:// or https:// prefix.",
				);
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

			// {
			// 	"target": "dataforseo.com",
			// 	"limit": 100,
			// 	"internal_list_limit": 10,
			// 	"backlinks_status_type": "live",
			// 	"include_subdomains": true,
			// 	"include_indirect_links": true,
			// 	"mode": "as_is" or "one_per_domain" or "one_per_anchor"
			// }

			// http://gosystem7.local/wp-json/localwiz-enhancements/v1/backlinks-explorer?t=dataforseo.com&is=true&iil=true&bst=live&ill=10&m=as_is

			const response = await axios.get(
				`${site_url.root_url}/wp-json/localwiz-enhancements/v1/backlinks-explorer?t=${formData.target}&is=${subdomainsValue}&iil=${includeIndirectLinksValue}&bst=${backlinkStatusTypeValue}&ill=${internalListLimit}&m=${modeValue}`,
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
			} else if (!response.data.tasks[0].status_message === "OK") {
				setError(
					`Error fetching data: "${response.data.tasks[0].status_message}" with status code: ${response.data.tasks[0].status_code}`,
				);
				setLoading(false);
				return;
			} else {
				const data = response.data;
				const items = data.tasks[0].result[0].items;
				let firstInstance = true;
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

				setFilename(`${formattedDate} ${formData.target}.csv`);
				setTime(parseFloat(data.time));
				setItems(csvData);

				console.log(csv);

				setResults(csvUrl);
				setLoading(false);
			}
		} catch (e) {
			setError(`Unable to fetch data: ${e.message}`);
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
								Target:
							</label>
							<input
								type="url"
								className="form-control"
								name="target"
								id="target"
								placeholder="ex. https://localdominator.co"
								onChange={(e) =>
									setFormData({ ...formData, target: e.target.value })
								}
								disabled={loading}
							/>
						</div>
					</div>
					<div className="row mb-3">
						<div className="col">
							<label for="mode" class="form-label">
								Mode:
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
								Include Subdomains:
							</label>
							<select
								className="form-select"
								aria-label="Default select example"
								id="includeSubdomains"
								onChange={(e) => setSubdomains(e.target.value)}
								disabled={loading}
							>
								<option value="1">Enable</option>
								<option value="2">Disable</option>
							</select>
						</div>
					</div>
					<div className="row mb-3">
						<div className="col">
							<label for="includeIndirectLinks" class="form-label">
								Include Indirect Links:
							</label>
							<select
								className="form-select"
								aria-label="Default select example"
								id="includeIndirectLinks"
								onChange={(e) => setIncludeIndirectLinks(e.target.value)}
								disabled={loading}
							>
								<option value="1">Enable</option>
								<option value="2">Disable</option>
							</select>
						</div>
						<div className="col">
							<label for="backlinkStatusType" class="form-label">
								Backlink Status Type:
							</label>
							<select
								className="form-select"
								aria-label="Default select example"
								id="backlinkStatusType"
								onChange={(e) => setBacklinkStatusType(e.target.value)}
								disabled={loading}
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
								Internal List Limit:
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
