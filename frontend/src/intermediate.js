import { verifyToken } from "./verify.js";
import { loadPage } from "./load-page.js";
async function redirectToPage() {
    try {
        await verifyToken();
        // await loadWholePage("/index");
        await loadPage(document.querySelector("header"), "/header", "header");
        await loadPage(document.querySelector("main"), "/index", "main");
    }
    catch (e) {
        console.error("Error:", e);
        window.location.href = "/login";
    }
}
(async () => {
    await redirectToPage();
})();
