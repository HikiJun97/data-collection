import { verifyToken } from "./verify";

document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const userId = document.getElementById("user-id").value;
  const userPw = document.getElementById("user-password").value;
  const remember = document.getElementById("remember-me").checked;

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
      userPw: userPw,
      rememeber: remember,
    }),
  })
    .then((response) => {
      let status_4XX = [401, 403];
      if (status_4XX.includes(response.status)) {
        document.getElementById("errorMsg").style.display = "block";
      } else {
        response.json().then((data) => {
          if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
            // set 'secure;' after domain attached
            sessionStorage.setItem("isLoggedIn", "true");
            console.log("Cookie saved");
            // let url = "/data-collection";
            // loadPage(url);
            window.location.href = "/index";
          }
        });
        document.getElementById("errorMsg").style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
});

function sendRequestWithToken() {
  // Local Storage에서 access token 가져오기
  const accessToken = localStorage.getItem("accessToken");
  console.log("accessToken: " + accessToken);

  if (accessToken) {
    console.log("accessToken exists");
    fetch("/verification", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Bearer 스키마를 사용한 인증 헤더 설정
      },
    })
      .then((response) => {
        let url = "/data-collection";
        loadPage(url);
      })
      .catch((error) => console.error("Error:", error));
  }
}

function loadPage(url) {
  fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  })
    .then((response) => {
      if (response.ok) return response.text();
      throw new Error("Failed to fetch data");
    })
    .then((html) => {
      document.documentElement.innerHTML = html;
      loadScript(html);
      let newTitle = url.split("/").at(-1);
      history.pushState(null, null, url);
    })
    .catch((error) => {
      console.error("Error fetching protected resources:", error);
    });
}

function loadScript(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const scripts = doc.querySelectorAll("script");
  scripts.forEach((script) => {
    const newScript = document.createElement("script");
    if (script.src) {
      newScript.src = script.src;
    } else {
      newScript.textContent = script.textContent;
    }
    document.body.appendChild(newScript);
  });
}

async function moveToIndex() {
  try {
    await verifyToken();
    window.location.href = "/index";
  } catch (error) {}
}

(async () => {
  await moveToIndex();
})();

// document.addEventListener("DOMContentLoaded", sendRequestWithToken);
