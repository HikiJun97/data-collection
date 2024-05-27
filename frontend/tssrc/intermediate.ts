import {verifyToken} from "./verify.js";
import {loadPage} from "./load-page.js";

async function redirectToPage(): Promise<void> {
	try {
		await verifyToken();
		console.log("window.fromPath: " + window.fromPath);
		console.log("type:", typeof (window.fromPath));
		await loadPage("/index");
	} catch (e) {
		console.error("Error:", e);
		window.location.href = "/login";
	}
}

(async () => {
	await redirectToPage();
})();
