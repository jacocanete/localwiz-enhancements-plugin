import react, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import Papa from "papaparse";
import { FaCheckCircle } from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";

const block = document.querySelectorAll(".results-update");

block.forEach(function (el) {
	ReactDOM.render(<Results />, el);
	el.classList.remove("results-update");
});

function Results() {
	const [params, setParams] = useState({});
	const [result, setResult] = useState({});
	const [error, setError] = useState("");
	const [tableData, setTableData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [resultType, setResultType] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	useEffect(() => {
		const params = getURLParams();
		setParams(params);

		const getResults = async () => {
			try {
				setError("");
				setLoading(true);
				const { type, id } = params;
				console.log(type, id);
				const response = await axios.get(
					`${site_url.root_url}/wp-json/localwiz-enhancements/v1/get-csv`,
					{
						headers: {
							"X-WP-Nonce": site_url.nonce,
						},
						params: {
							request_type: type,
							id: id,
						},
					},
				);

				if (!response.statusText === "OK") {
					setError(`Unable to fetch saved results: ${error.message}`);
					return;
				} else {
					const data = response.data;
					if (data.data.length === 0) {
						setError("No results found in the database.");
						return;
					}
					const result = data.data[0];
					setResult(result);
					const parsedResult = Papa.parse(result.csv_url, {
						download: true,
						header: true,
						worker: true,
						complete: function (results) {
							console.log(params.type);
							if (type === "instant-pages") {
								setResultType("instant-pages");
							}
							console.log(results.data);
							setTableData(results.data);
							setLoading(false);
						},
						error: function (error) {
							setError(`Unable to parse saved results: ${error.message}`);
							setLoading(false);
						},
					});
				}
			} catch (error) {
				setError(`Unable to fetch saved results: Unauthorized access`);
			}
		};

		getResults();
	}, []);

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(tableData.length / itemsPerPage);

	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
	};

	const renderPagination = () => {
		const pageNumbers = [];
		const ellipsis = (
			<li className="page-item">
				<span className="page-link">...</span>
			</li>
		);

		if (totalPages <= 10) {
			for (let i = 1; i <= totalPages; i++) {
				pageNumbers.push(
					<li
						key={i}
						className={`page-item ${currentPage === i ? "active" : ""}`}
					>
						<button className="page-link" onClick={() => handlePageChange(i)}>
							{i}
						</button>
					</li>,
				);
			}
		} else {
			const startPage = Math.max(2, currentPage - 2);
			const endPage = Math.min(totalPages - 1, currentPage + 2);

			pageNumbers.push(
				<li
					key={1}
					className={`page-item ${currentPage === 1 ? "active" : ""}`}
				>
					<button className="page-link" onClick={() => handlePageChange(1)}>
						1
					</button>
				</li>,
			);

			if (startPage > 2) {
				pageNumbers.push(ellipsis);
			}

			for (let i = startPage; i <= endPage; i++) {
				pageNumbers.push(
					<li
						key={i}
						className={`page-item ${currentPage === i ? "active" : ""}`}
					>
						<button className="page-link" onClick={() => handlePageChange(i)}>
							{i}
						</button>
					</li>,
				);
			}

			if (endPage < totalPages - 1) {
				pageNumbers.push(ellipsis);
			}

			pageNumbers.push(
				<li
					key={totalPages}
					className={`page-item ${currentPage === totalPages ? "active" : ""}`}
				>
					<button
						className="page-link"
						onClick={() => handlePageChange(totalPages)}
					>
						{totalPages}
					</button>
				</li>,
			);
		}

		return (
			<ul className="pagination">
				<li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
					<button
						className="page-link"
						onClick={() => handlePageChange(currentPage - 1)}
					>
						Previous
					</button>
				</li>
				{pageNumbers}
				<li
					className={`page-item ${
						currentPage === totalPages ? "disabled" : ""
					}`}
				>
					<button
						className="page-link"
						onClick={() => handlePageChange(currentPage + 1)}
					>
						Next
					</button>
				</li>
			</ul>
		);
	};

	return (
		<div className="container mb-4">
			<div className="p-4 border shadow inner">
				{loading ? (
					<div className="d-flex align-items-center gap-2">
						<span
							className="spinner-border spinner-border-sm"
							role="status"
							aria-hidden="true"
						></span>
						Loading saved results...
					</div>
				) : (
					<>
						{error && (
							<div className="alert alert-danger" role="alert">
								{error}
							</div>
						)}
						{resultType === "instant-pages" ? (
							<div className="row table-responsive">
								<table className="table table-striped table-hover">
									<thead className="table-dark">
										<tr>
											<th>
												{Array.isArray(tableData) && tableData.length > 0
													? tableData[0].url
													: ""}
											</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{currentItems.length > 0 &&
											Object.keys(currentItems[0]).map((key, index) => {
												if (key === "url") return null; // Skip if the key is 'url'

												return (
													<tr key={index}>
														<td>{toTitleCase(key)}</td>
														<td>
															{currentItems[0][key] === "Yes" ? (
																<FaCheckCircle size={20} color="green" />
															) : (
																<FaCircleXmark size={20} color="red" />
															)}
														</td>
													</tr>
												);
											})}
									</tbody>
								</table>
							</div>
						) : (
							<>
								<div className="row table-responsive">
									<table className="table table-striped table-hover">
										<thead className="table-dark">
											<tr>
												{currentItems.length > 0 &&
													Object.keys(currentItems[0]).map((key, index) => (
														<th key={index}>{key}</th>
													))}
											</tr>
										</thead>
										<tbody>
											{currentItems.map((item, index) => (
												<tr key={index}>
													{Object.values(item).map((value, i) => (
														<td key={i} className="text-truncate">
															{typeof value === "string" &&
															value.startsWith("http") ? (
																<a
																	href={value}
																	target="_blank"
																	rel="noreferrer"
																>
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
								{tableData.length > 10 && (
									<div className="d-flex align-items-center justify-content-center">
										<nav aria-label="Page navigation example" className="mt-4">
											{renderPagination()}
										</nav>
									</div>
								)}
							</>
						)}
					</>
				)}
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

function toTitleCase(str) {
	return str
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}
