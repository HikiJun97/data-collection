import { loadPage } from "./load-page.js";
const normalUserSelection = document.querySelector("#normal.user-selection");
const adminUserSelection = document.querySelector("#admin.user-selection");
if (normalUserSelection) {
    normalUserSelection.addEventListener("click", async () => {
        await loadPage("/data-collection");
    });
}
if (adminUserSelection) {
    adminUserSelection.addEventListener("click", async () => {
        await loadPage("/validation");
    });
}
