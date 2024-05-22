import { verifyToken } from "./verify";
import { loadPage } from "./load-pages";

async function redirectToPage() {
  try {
    await verifyToken();
    console.log("window.fromPath: " + window.fromPath);
    if (window.fromPath === undefined) {
      await loadPage("/index");
    }
    await loadPage(window.fromPath);
  } catch (e) {
    console.error("Error:", e);
    window.location.href = "/login";
  }
}

(async () => {
  await redirectToPage();
})();
