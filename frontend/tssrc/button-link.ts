import { loadPage } from "./load-page.js";

const normalUserSelection = document.querySelector(
  "#normal.user-selection"
) as HTMLElement;
const adminUserSelection = document.querySelector(
  "#admin.user-selection"
) as HTMLElement;

if (normalUserSelection) {
  normalUserSelection.addEventListener("click", async () => {
    // await loadPage("/data-collection");
    await loadPage(
      document.querySelector("main") as HTMLElement,
      "/face-crop",
      "main"
    );
  });
}

if (adminUserSelection) {
  adminUserSelection.addEventListener("click", async () => {
    await loadPage(
      document.querySelector("main") as HTMLElement,
      "/validation",
      "main"
    );
  });
}
