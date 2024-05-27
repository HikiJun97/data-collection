async function setDatumValidated(isvalid: boolean) {
	const datumId: string | null = (document.getElementById('data-selection') as HTMLSelectElement)?.tomselect.getValue();
	const valid: boolean = isvalid;
	const validator: string = (document.getElementById("nameplate") as HTMLElement)?.innerText;
	const speakingType = (document.getElementById('speaking-type-selection') as HTMLSelectElement)?.tomselect.getValue() as string;
	const gender = (document.getElementById('gender-selection') as HTMLSelectElement)?.tomselect.getValue() as string;
	const age = (document.getElementById('age-selection') as HTMLSelectElement)?.tomselect.getValue() as string;
	console.log(datumId, speakingType, gender, age);

	const accessToken: string | null = localStorage.getItem("accessToken");
	if (!accessToken) {
		throw new Error("Access Token doesn't exist.");
	}
	fetch("/validation/valid", {
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
			const usersData: Array<User> = JSON.parse(sessionStorage.getItem("users") as string);
			let userObject: User | undefined = usersData.find((user) => user.id === data.user_id);
			let datum: Datum | undefined = userObject?.data.find((datum) => datum.id === datumId);
			if (datum) {
				datum.valid = valid;
				datum.validated = true;
				datum.validator = validator;
				datum.gender = gender;
				datum.age = age;
			}
			sessionStorage.setItem("users", JSON.stringify(usersData));
		});
}

document.getElementById("valid-button")?.addEventListener("click", () => {
	setDatumValidated(true);
});

document.getElementById("invalid-button")?.addEventListener("click", () => {
	setDatumValidated(false);
});
