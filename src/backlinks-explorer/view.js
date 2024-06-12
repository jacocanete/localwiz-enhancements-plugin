import react from "react";
import reactDOM from "react-dom";

const block = document.querySelectorAll(".backlinks-explorer-update");

block.forEach(function (el) {
	ReactDOM.render(<BacklinksExplorer />, el);
	el.classList.remove("backlinks-explorer-update");
});

function BacklinksExplorer() {
	return (
		<div className="container">
			<div className="p-4 border shadow inner">
				<form>
					<div className="row mb-3">
						<div className="col">
							<label for="target" class="form-label">
								Target:
							</label>
							<input type="url" class="form-control" id="target" />
						</div>
					</div>
					<div className="row mb-3">
						<div className="col">
							<label for="target" class="form-label">
								Mode:
							</label>
							<select
								className="form-select"
								aria-label="Default select example"
							>
								<option selected value="1">
									As Is
								</option>
								<option value="2">One Per Domain</option>
								<option value="3">One Per Anchor</option>
							</select>
						</div>
						<div className="col">
							<label for="target" class="form-label">
								Include Subdomains:
							</label>
							<select
								className="form-select"
								aria-label="Default select example"
							>
								<option selected value="1">
									Enable
								</option>
								<option value="2">Disable</option>
							</select>
						</div>
					</div>
					<div className="row mb-3">
						<div className="col">
							<label for="target" class="form-label">
								Include Indirect Links:
							</label>
							<select
								className="form-select"
								aria-label="Default select example"
							>
								<option selected value="1">
									Enable
								</option>
								<option value="2">Disable</option>
							</select>
						</div>
						<div className="col">
							<label for="target" class="form-label">
								Backlink Status Type:
							</label>
							<select
								className="form-select"
								aria-label="Default select example"
							>
								<option selected value="1">
									All
								</option>
								<option value="2">Live</option>
								<option value="3">Lost</option>
							</select>
						</div>
					</div>
					<div className="row mb-3">
						<div className="col">
							<label for="target" class="form-label">
								Internal List Limit:
							</label>
							<input
								type="number"
								class="form-control"
								id="target"
								min="1"
								max="1000"
							/>
						</div>
						<div className="col"></div>
					</div>
					<div className="row mb-3">
						<div className="col">
							<button className="btn btn-success w-100">Submit</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
