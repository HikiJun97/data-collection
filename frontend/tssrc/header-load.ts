async function loadHeader(): Promise<void> {
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
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      window.location.href = "/login";
      return;
    }

    const responseData = await response.json();
    const username = responseData.username;
    updateNameplate(username);

    const loginButton = document.querySelector(
      "#login-button"
    ) as HTMLButtonElement;
    loginButton.innerText = "Logout";
    loginButton.onclick = clearAuthTokens;
  } catch (e) {
    console.error("Error verifying token:", e);
  }
}

function updateNameplate(username: string): void {
  const nameplate = document.querySelector("#nameplate") as HTMLElement;
  nameplate.innerText = username;
  nameplate.style.display = "block";
}

function clearAuthTokens(): void {
  localStorage.removeItem("accessToken");
  document.cookie =
    "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/login";
}

(async () => {
  await loadHeader();
})();
