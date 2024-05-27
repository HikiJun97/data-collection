import { readme } from "./readme";
import { Converter } from "showdown";
import videojs from "video.js";
window.onload = () => {
    const checkButton = document.getElementById("check-button");
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
        const userInfoElement = document.getElementById("user-info");
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
    const markdownConverter = new Converter();
    const markdownToHTML = markdownConverter.makeHtml(readme);
    const readmeElement = document.getElementById("readme");
    if (readmeElement) {
        readmeElement.innerHTML = markdownToHTML;
    }
}
function checkVideo(event) {
    const buttonElement = event.target;
    buttonElement.disabled = true;
    const startTimeInput = document.getElementById("start-time-input");
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
