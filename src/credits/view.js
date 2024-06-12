import react, { useState } from "react";
import ReactDOM from "react-dom";

const block = document.querySelectorAll(".credits-update");

block.forEach(function (el) {
	ReactDOM.render(<Credits />, el);
	el.classList.remove("credits-update");
});

function Credits() {
	return (
		<div className="container">
			<div className="p-4 border shadow inner">
				<div className="row">
					<div className="col d-flex justify-content-start align-items-center gap-2">
						<span>Credit Balance: $1000.00</span>
					</div>
					<div className="col d-flex justify-content-end align-items-center gap-2">
						<button className="btn btn-dark" href="#">
							Login
						</button>
						<a
							className="btn btn-secondary"
							role="button"
							href={`${auth_urls.register_url}`}
						>
							Register
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
