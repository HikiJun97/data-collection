async function setDatumValidated(isvalid) {
  let datumId = document.getElementById("data-selection").tomselect.getValue();
  let valid = isvalid;
  let validator = document.getElementById("nameplate").innerText;
  let speakingType = document
    .getElementById("speaking-type-selection")
    .tomselect.getValue();
  let gender = document.getElementById("gender-selection").tomselect.getValue();
  let age = document.getElementById("age-selection").tomselect.getValue();
  console.log(datumId, speakingType, gender, age);

  const accessToken = localStorage.getItem("accessToken");
  await fetch("/validation/valid", {
    method: "POST",
    headers: {
      "Content-Type": "applicatoin/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      datum_id: datumId,
      valid: valid,
      validator: validator,
      speaking_type: speakingType,
      gender: gender,
      age: age,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      let usersData = JSON.parse(sessionStorage.getItem("users"));
      let userObject = usersData.find((user) => user.id === data.user_id);
      let datum = userObject.data.find((datum) => datum.id === datumId);
      datum.valid = valid;
      datum.validated = true;
      datum.validator = validator;
      datum.gender = gender;
      datum.age = age;
      sessionStorage.setItem("users", JSON.stringify(usersData));
    });
}

document.getElementById("valid-button").addEventListener("click", () => {
  setDatumValidated(true);
});

document.getElementById("invalid-button").addEventListener("click", () => {
  setDatumValidated(false);
});