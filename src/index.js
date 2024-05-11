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
        let status_4XX = [401, 403];
        if (status_4XX.includes(response.status)) {
          window.location.href = "/login";
        }
        response.json().then((data) => {
          let user = data.user;
          console.log("user: " + user);
          let nameplate = document.querySelector("#nameplate");
          nameplate.style.display = "inline";
          nameplate.innerText = user;
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

// 페이지 로딩 시 자동으로 실행되게 이벤트 리스너 추가
window.onload = sendRequestWithToken;
