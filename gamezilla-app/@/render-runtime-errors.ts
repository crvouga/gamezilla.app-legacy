/**
 * Use this to render runtime errors to the screen.
 * This is useful for debugging on mobile devices.
 */
export const renderRuntimeErrors = () => {
	window.onerror = (errorMsg, url, lineNumber, column, _errorObj) => {
		showError(errorMsg, url, lineNumber, column);
	};

	window.addEventListener("unhandledrejection", (msgEvt) => {
		showError(msgEvt.reason.toString());
	});

	function showError(
		errorMsg: unknown,
		url?: unknown,
		lineNumber?: unknown,
		column?: unknown,
	) {
		const errorDiv = document.createElement("div");
		errorDiv.style.color = "red";
		errorDiv.style.position = "fixed";
		errorDiv.style.top = "0";
		errorDiv.style.left = "0";
		errorDiv.style.backgroundColor = "white";
		errorDiv.innerHTML = `Error: ${errorMsg}${
			url ? ` - at ${url}: ${lineNumber}:${column}` : ""
		}`;
		document.body.appendChild(errorDiv);
	}
};
