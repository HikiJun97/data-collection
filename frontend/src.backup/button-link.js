import loadPage from "./src/load-page";

document
  .querySelector("#normal.user-selection")
  .addEventListener("click", async () => {
    await loadPage("/data-collection");
  });

document
  .querySelector("#admin.user-selection")
  .addEventListener("click", async () => {
    await loadPage("/validation");
  });
