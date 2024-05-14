function verifyToken() {
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
        } else {
          window.location.href = "/index";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        window.location.href = "/login";
      });
  } else {
    console.log("redirect to /login");
    window.location.href = "/login";
  }
}

verifyToken();
