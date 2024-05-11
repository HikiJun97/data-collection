document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const userId = document.getElementById("floatingInput").value;
  const userPw = document.getElementById("floatingPassword").value;
  const remember = document.getElementById("flexCheckDefault").checked;

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
      userPw: userPw,
      rememeber: remember,
    }),
  })
    .then((response) => {
      let status_4XX = [401, 403];
      if (status_4XX.includes(response.status)) {
        document.getElementById("errorMsg").style.display = "block";
      } else {
        response.json().then((data) => {
          if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
            // set 'secure;' after domain attached
            sessionStorage.setItem("isLoggedIn", "true");
            console.log("Cookie saved");
            let url = "/data-collection/face-crop";
            loadPage(url);
          }
        });
        document.getElementById("errorMsg").style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
});

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
      document.body.innerHTML = html;
      console.log(url.split("/").at(-1));
      history.pushState(null, url.split("/").at(-1), url);
    })
    .catch((error) => {
      console.error("Error fetching protected resources:", error);
    });
}
