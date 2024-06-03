export async function verifyToken(): Promise<username> {
  const accessToken: string | null = localStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error("No access token");
  }

  const response: Response = await fetch("/verification", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.ok) {
    return response.json() as Promise<username>;
  } else {
    throw new Error("Failed to verify token");
  }
}

export interface username {
  username: string;
}
