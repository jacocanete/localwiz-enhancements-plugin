import react, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";

const block = document.querySelectorAll(".results-update");

block.forEach(function (el) {
	ReactDOM.render(<Results />, el);
	el.classList.remove("results-update");
});

function Results() {
	useEffect(() => {
		const params = getURLParams();
		console.log(params);
	}, []);

	const getResults = async () => {
		try {
			const response = axios.get(
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
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className="container">
			<div className="p-4 border shadow inner">
				<div className="row">Hello from front-end</div>
			</div>
		</div>
	);
}

function getURLParams() {
	const params = new URLSearchParams(window.location.search);
	return Array.from(params.entries()).reduce(
		(obj, [key, value]) => ({ ...obj, [key]: value }),
		{},
	);
}

{
	/*
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
 	*/
}
