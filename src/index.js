function sendRequestWithToken() {
  // Local Storage에서 access token 가져오기
  const accessToken = localStorage.getItem("accessToken");

  // accessToken이 존재할 때만 요청 보내기
  if (accessToken) {
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
          window.location.href("/login");
        }
        response.json().then((data) => console.log(data));
      })
      .catch((error) => console.error("Error:", error));
  } else {
    window.location.href("/login");
  }
}

// 페이지 로딩 시 자동으로 실행되게 이벤트 리스너 추가
window.onload = sendRequestWithToken;
