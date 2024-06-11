import react from "react";
import reactDOM from "react-dom";

const block = document.querySelectorAll(".backlinks-explorer-update");

block.forEach(function (el) {
	ReactDOM.render(<BacklinksExplorer />, el);
	el.classList.remove("backlinks-explorer-update");
});

function BacklinksExplorer() {
	return (
		<div>
			<h3>Backlinks Explorer Block Hi from front-end</h3>
		</div>
	);
}
