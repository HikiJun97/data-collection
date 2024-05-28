import { loadPage } from "./load-page.js";

async function loadHeader(): Promise<void> {
  // Local Storage에서 access token 가져오기
  const accessToken: string | null = localStorage.getItem("accessToken");
  console.log("accessToken: " + accessToken);

  if (!accessToken) {
    window.location.href = "/login";
    return;
  }

  const headerContainer = document.querySelector("header") as HTMLElement;
  await loadPage(headerContainer, "/header", "header");
  await loadLoggedInHeader(accessToken); // 그 다음에 인증 상태를 확인하여 업데이트
}

async function loadLoggedInHeader(accessToken: string): Promise<void> {
  try {
    console.log("accessToken exists");
    const response = await fetch("/verification", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Bearer 스키마를 사용한 인증 헤더 설정
      },
    });

    if (response.status === 401 || response.status === 403) {
      window.location.href = "/login";
      return;
    }

    const data = await response.json();
    const username = data.username;
    console.log("username: " + username);
    (document.getElementById("nameplate") as HTMLParagraphElement).innerText =
      username;
    const loginButton = document.querySelector(
      "#login-button"
    ) as HTMLButtonElement;
    if (loginButton) {
      loginButton.innerText = "Logout";
      loginButton.onclick = clearAuthTokens;
    }
  } catch (e) {
    console.error("Error verifying token:", e);
  }
}

function clearAuthTokens(): void {
  localStorage.removeItem("accessToken");
  document.cookie =
    "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/login";
  return;
}

(async () => {
  await loadHeader(); // loadHeader 내부에서 loadHeaderHtml과 loadLoggedInHeader 호출
})();
