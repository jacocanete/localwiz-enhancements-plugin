import react, { useState } from "react";
import ReactDOM from "react-dom";

const block = document.querySelectorAll(".credits-update");

block.forEach(function (el) {
	ReactDOM.render(<Credits />, el);
	el.classList.remove("credits-update");
});

function Credits() {
	console.log(auth);
	const { register_url, logged_in, logout_url } = auth;

	return (
		<div className="container">
			<div className="p-4 border shadow inner">
				<div className="row">
					<div className="col d-flex justify-content-start align-items-center gap-2">
						<span>Credit Balance: $1000.00</span>
					</div>
					<div className="col d-flex justify-content-end align-items-center gap-2">
						{logged_in ? (
							<a className="btn btn-dark" role="button" href={`${logout_url}`}>
								Logout
							</a>
						) : (
							<>
								<button className="btn btn-dark" href="#">
									Login
								</button>
								<a
									className="btn btn-secondary"
									role="button"
									href={`${auth.register_url}`}
								>
									Register
								</a>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
