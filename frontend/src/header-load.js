function loadHeaderWithToken() {
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
        let status_4XX = [401, 403];
        if (status_4XX.includes(response.status)) {
          window.location.href = "/login";
        }
        response.json().then((data) => {
          let username = data.username;
          let nameplate = document.querySelector("#nameplate");
          nameplate.style.display = "inline";
          nameplate.innerText = username;
          let loginButton = document.querySelector("#login-button");
          loginButton.innerText = "Logout";
          loginButton.onclick = clearAuthTokens;
        });
      })
      .catch((error) => console.error("Error:", error));
  } else {
    console.log("redirect to /login");
    window.location.href = "/login";
  }
}

function clearAuthTokens() {
  localStorage.removeItem("accessToken");
  document.cookie =
    "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/login";
}

loadHeaderWithToken();