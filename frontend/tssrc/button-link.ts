import { loadPage } from "./load-page";

const normalUserSelection = document.querySelector(
  "#normal.user-selection"
) as HTMLElement;
const adminUserSelection = document.querySelector(
  "#admin.user-selection"
) as HTMLElement;

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
