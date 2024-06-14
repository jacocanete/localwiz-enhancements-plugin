import react, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { TiRefresh } from "react-icons/ti";

const block = document.querySelectorAll(".credits-update");

block.forEach(function (el) {
	ReactDOM.render(<Credits />, el);
	el.classList.remove("credits-update");
});

function Credits() {
	const { register_url, logged_in, logout_url } = auth;
	const [credits, setCredits] = useState(0);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchCredits();
	}, []);

	const fetchCredits = async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				`${site_url.root_url}/wp-json/localwiz-enhancements/v1/credits`,
				{
					headers: {
						"X-WP-Nonce": site_url.nonce,
					},
				},
			);

			console.log(response);

			if (response.statusText !== "OK") {
				console.error("Error fetching data");
				setLoading(false);
				return;
			} else {
				setCredits(response.data.balance);
			}

			console.log(response);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
		}
	};

	return (
		<div className="container">
			<div className="p-4 border shadow inner">
				<div className="row">
					<div className="col d-flex justify-content-start align-items-center gap-2">
						<button className="btn btn-primary" onClick={fetchCredits}>
							Refresh
						</button>
						<span>Credit Balance:</span>
						{loading ? (
							<span
								class="spinner-border spinner-border-sm"
								role="status"
								aria-hidden="true"
							></span>
						) : (
							<span>
								${typeof credits === "number" ? credits.toFixed(4) : credits}
							</span>
						)}
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
