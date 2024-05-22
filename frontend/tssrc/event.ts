import { readme } from "./readme";
import { Converter } from "showdown";
import videojs from "video.js";
import TimeElement from "./TimeElement";

interface UserInfo {
  value: string;
}

window.onload = () => {
  const checkButton = document.getElementById(
    "check-button"
  ) as HTMLButtonElement;
  if (checkButton) {
    checkButton.addEventListener("click", checkVideo);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  fetchUserInfo();
  convertMdToHtml();
  videojs("my-video", {
    playbackRates: [0.5, 1, 1.5, 2],
    fluid: true,
  });
});

function fetchUserInfo() {
  fetch("http://localhost:8000/value")
    .then((res) => res.json())
    .then((data) => {
      const userInfoElement = document.getElementById(
        "user-info"
      ) as HTMLElement;
      if (userInfoElement) {
        userInfoElement.textContent = data.value;
      }
      console.log(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function convertMdToHtml() {
  const markdownConverter: Converter = new Converter();
  const markdownToHTML: string = markdownConverter.makeHtml(readme);
  const readmeElement = document.getElementById("readme") as HTMLElement;
  if (readmeElement) {
    readmeElement.innerHTML = markdownToHTML;
  }
}

function checkVideo(event: Event) {
  const buttonElement = event.target as HTMLButtonElement;
  buttonElement.disabled = true;
  const startTimeInput = document.getElementById(
    "start-time-input"
  ) as TimeElement;
  if (startTimeInput) {
    console.log(startTimeInput.getTimeValues());
  }
  fetch("http://localhost:8000/check-video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("response:", data);
      buttonElement.disabled = false;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
