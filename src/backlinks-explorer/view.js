import react, { useState } from "react";
import reactDOM from "react-dom";

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

	const handleSubmit = (e) => {
		e.preventDefault();
	};

	// console.log(
	// 	formData,
	// 	mode,
	// 	subdomains,
	// 	includeIndirectLinks,
	// 	backlinkStatusType,
	// 	internalListLimit,
	// );

	return (
		<div className="container">
			<div className="p-4 border shadow inner">
				<form onSubmit={handleSubmit}>
					<div className="row mb-3">
						<div className="col">
							<label for="target" class="form-label">
								Target:
							</label>
							<input
								type="url"
								class="form-control"
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
			</div>
		</div>
	);
}
