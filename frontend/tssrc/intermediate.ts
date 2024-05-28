import { verifyToken } from "./verify.js";
import { loadWholePage, loadPage } from "./load-page.js";

async function redirectToPage(): Promise<void> {
  try {
    await verifyToken();
    // await loadWholePage("/index");
    await loadPage(
      document.querySelector("header") as HTMLElement,
      "/header",
      "header"
    );
    await loadPage(
      document.querySelector("main") as HTMLElement,
      "/index",
      "main"
    );
  } catch (e) {
    console.error("Error:", e);
    window.location.href = "/login";
  }
}

(async () => {
  await redirectToPage();
})();
