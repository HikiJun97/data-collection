"use strict";
async function loadHeaderHtml() {
    const header = document.querySelector("header");
    if (header) {
        try {
            const response = await fetch("/header");
            const parser = new DOMParser();
            const doc = parser.parseFromString(await response.text(), "text/html");
            console.log(doc.body.innerHTML);
            header.innerHTML = doc.body.innerHTML;
        }
        catch (e) {
            console.error("Error:", e);
        }
    }
}
async function loadHeader() {
    // Local Storage에서 access token 가져오기
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
                Authorization: `Bearer ${accessToken}`, // Bearer 스키마를 사용한 인증 헤더 설정
            },
        });
        if (response.status === 401 || response.status === 403) {
            window.location.href = "/login";
            return;
        }
        const data = await response.json();
        const username = data.username;
        document.getElementById("nameplate").innerText = username;
        const loginButton = document.querySelector("#login-button");
        if (loginButton) {
            loginButton.innerText = "Logout";
            loginButton.onclick = clearAuthTokens;
        }
    }
    catch (e) {
        console.error("Error:", e);
    }
}
function clearAuthTokens() {
    localStorage.removeItem("accessToken");
    document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/login";
    return;
}
(async () => {
    // await loadHeaderHtml();
    await loadHeader();
})();
