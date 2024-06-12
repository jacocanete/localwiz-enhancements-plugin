/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ ((module) => {

module.exports = window["ReactDOM"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!****************************************!*\
  !*** ./src/backlinks-explorer/view.js ***!
  \****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);



const block = document.querySelectorAll(".backlinks-explorer-update");
block.forEach(function (el) {
  ReactDOM.render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(BacklinksExplorer, null), el);
  el.classList.remove("backlinks-explorer-update");
});
function BacklinksExplorer() {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "container"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "p-4 border shadow inner"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("form", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "row mb-3"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "col"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    for: "target",
    class: "form-label"
  }, "Target:"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "url",
    class: "form-control",
    id: "target"
  }))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "row mb-3"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "col"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    for: "target",
    class: "form-label"
  }, "Mode:"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("select", {
    className: "form-select",
    "aria-label": "Default select example"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    selected: true,
    value: "1"
  }, "As Is"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: "2"
  }, "One Per Domain"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: "3"
  }, "One Per Anchor"))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "col"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    for: "target",
    class: "form-label"
  }, "Include Subdomains:"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("select", {
    className: "form-select",
    "aria-label": "Default select example"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    selected: true,
    value: "1"
  }, "Enable"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: "2"
  }, "Disable")))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "row mb-3"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "col"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    for: "target",
    class: "form-label"
  }, "Include Indirect Links:"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("select", {
    className: "form-select",
    "aria-label": "Default select example"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    selected: true,
    value: "1"
  }, "Enable"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: "2"
  }, "Disable"))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "col"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    for: "target",
    class: "form-label"
  }, "Backlink Status Type:"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("select", {
    className: "form-select",
    "aria-label": "Default select example"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    selected: true,
    value: "1"
  }, "All"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: "2"
  }, "Live"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("option", {
    value: "3"
  }, "Lost")))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "row mb-3"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "col"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    for: "target",
    class: "form-label"
  }, "Internal List Limit:"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "number",
    class: "form-control",
    id: "target",
    min: "1",
    max: "1000"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "col"
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "row mb-3"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "col"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    className: "btn btn-success w-100"
  }, "Submit"))))));
}
/******/ })()
;
//# sourceMappingURL=view.js.map