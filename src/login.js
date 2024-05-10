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
      if (response.status === 403) {
        document.getElementById("errorMsg").style.display = "block";
      } else {
        response.json().then((data) => {
          if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
            // set 'secure;' after domain attached
            sessionStorage.setItem("isLoggedIn", "true");
            console.log("Cookie saved");
            // window.location.href = "/data-collection/face-crop";
            // fetch("/data-collection/face-crop", {
            //   headers: {
            //     Authorization: `Bearer ${data.accessToken}`,
            //   },
            // })
            //   .then((response) => {
            //     if (response.ok) return response.text();
            //     throw new Error("Failed to fetch data");
            //   })
            //   .then((html) => {
            //     document.body.innerHTML = html;
            //   })
            //   .catch((error) => {
            //     console.error("Error fetching protected resources:", error);
            //   });
          }
        });
        document.getElementById("errorMsg").style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Error during fetch:", error);
    });
});
