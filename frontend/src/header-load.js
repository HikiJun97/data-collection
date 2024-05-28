"use strict";
async function loadHeader() {
    const accessToken = localStorage.getItem("accessToken");
    console.log("accessToken: " + accessToken);
    if (!accessToken) {
        window.location.href = "/login";
        return;
    }
    await loadLoggedInHeader(accessToken);
}
async function loadLoggedInHeader(accessToken) {
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
        const loginButton = document.querySelector("#login-button");
        loginButton.innerText = "Logout";
        loginButton.onclick = clearAuthTokens;
    }
    catch (e) {
        console.error("Error verifying token:", e);
    }
}
function updateNameplate(username) {
    const nameplate = document.querySelector("#nameplate");
    nameplate.innerText = username;
    nameplate.style.display = "block";
}
function clearAuthTokens() {
    localStorage.removeItem("accessToken");
    document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
}
(async () => {
    await loadHeader();
})();
