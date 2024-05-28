import { loadPage } from "./load-page.js";
const normalUserSelection = document.querySelector("#normal.user-selection");
const adminUserSelection = document.querySelector("#admin.user-selection");
if (normalUserSelection) {
    normalUserSelection.addEventListener("click", async () => {
        // await loadPage("/data-collection");
        await loadPage(document.querySelector("main"), "/face-crop", "main");
    });
}
if (adminUserSelection) {
    adminUserSelection.addEventListener("click", async () => {
        await loadPage(document.querySelector("main"), "/validation", "main");
    });
}
