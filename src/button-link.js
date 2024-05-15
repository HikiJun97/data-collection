function sendRequestWithToken(url) {
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
  copyAllScripts(scripts);
}

function copyAllScripts(scripts) {
  scripts.forEach((script) => {
    const newScript = document.createElement("script");

    for (let attr of script.attributes) {
      newScript.setAttribute(attr.name, attr.value);
    }
    newScript.textContent = script.textContent;
    document.body.appendChild(newScript);
  });
}

document
  .querySelector("#normal.user-selection")
  .addEventListener("click", () => {
    sendRequestWithToken("/data-collection");
  });

document
  .querySelector("#admin.user-selection")
  .addEventListener("click", () => {
    sendRequestWithToken("/validation");
  });
