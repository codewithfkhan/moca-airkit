export const getAirVerifierAuthToken = async (verifierDid, apiKey, apiUrl) => {
    try {
        const response = await fetch(`${apiUrl}/verifier/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "accept": "*/*",
                "X-Test": "true",
            },
            body: JSON.stringify({
                verifierDid: verifierDid,
                authToken: apiKey,
            }),
        });

        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }

        const data = await response.json();
        if (data.code === 80000000 && data.data && data.data.token) {
            return data.data.token;
        } else {
            console.error("Failed to get verifier auth token:", data.msg || "Unknown error");
            return null;
        }
    } catch (error) {
        console.error("Error fetching verifier auth token:", error);
        return null;
    }
};