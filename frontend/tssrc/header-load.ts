async function loadHeaderHtml(): Promise<void> {
  const header = document.querySelector("header") as HTMLElement;
  if (header) {
    try {
      const response = await fetch("/header.html");
      header.innerHTML = await response.text();
    } catch (e) {
      console.error("Error:", e);
    }
  }
}

async function loadHeader(): Promise<void> {
  // Local Storage에서 access token 가져오기
  const accessToken: string | null = localStorage.getItem("accessToken");
  console.log("accessToken: " + accessToken);

  if (!accessToken) {
    window.location.href = "/login";
    return;
  }

  await loadLoggedInHeader(accessToken);
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
    const nameplate = document.querySelector("#nameplate") as HTMLElement;
    const loginButton = document.querySelector(
      "#login-button"
    ) as HTMLButtonElement;
    if (loginButton) {
      loginButton.innerText = "Logout";
      loginButton.onclick = clearAuthTokens;
    }
  } catch (e) {
    console.error("Error:", e);
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
  await loadHeaderHtml();
})();
