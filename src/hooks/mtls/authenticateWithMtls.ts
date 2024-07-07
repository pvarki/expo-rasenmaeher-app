import * as SecureStore from "expo-secure-store";

export const authenticateWithMTLS = async () => {
  try {
    // Perform the mTLS authentication with the backend
    const response = await fetch("https://your-backend-url/authenticate", {
      method: "POST",
      // Provide necessary headers and mTLS client certificate
      headers: {
        "Content-Type": "application/json",
      },
      // Include additional options if necessary
    });

    if (!response.ok) {
      throw new Error("Authentication failed");
    }

    const sessionData = await response.json();
    await SecureStore.setItemAsync("session", JSON.stringify(sessionData));
    return sessionData;
  } catch (error) {
    console.error("Failed to authenticate with mTLS", error);
    throw error;
  }
};
