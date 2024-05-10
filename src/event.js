import { readme } from "./readme";
import { Converter } from "showdown";

window.onload = function () {
  document.getElementById("check-button").addEventListener("click", checkVideo);
};

document.addEventListener("DOMContentLoaded", function () {
  fetchUserInfo();
  convertMdToHtml();
  videojs("my-video", {
    playbackRates: [0.5, 1, 1.5, 2],
    fluid: true,
  });
});

function fetchUserInfo() {
  fetch("http://localhost:8000/value")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("user-info").textContent = data.value;
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function convertMdToHtml() {
  let markdownConverter = new Converter();
  let markdownToHTML = markdownConverter.makeHtml(readme);
  document.getElementById("readme").innerHTML = markdownToHTML;
}

function checkVideo(event) {
  let buttonElement = event.target;
  event.target.disabled = true;
  start_time = document.getElementById("start-time-input");
  console.log(start_time.getTimeValues());
  fetch("http://localhost:8000/check-video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("response:", data);
      event.target.disabled = false;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
