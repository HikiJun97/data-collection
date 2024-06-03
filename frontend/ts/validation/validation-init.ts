import { fetchVideo } from "./fetch-video.js";
import { initSelect } from "./select-init.js";

document.getElementById("fetch-button")?.addEventListener("click", async () => {
  await fetchVideo();
});

(async () => {
  await initSelect();
})();
