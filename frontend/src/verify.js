export async function verifyToken() {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        throw new Error("No access token");
    }
    const response = await fetch("/verification", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });
    if (response.ok) {
        return response.json();
    }
    else {
        throw new Error("Failed to verify token");
    }
}
