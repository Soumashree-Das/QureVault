import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = "http://192.168.0.202:8080";

export const apiFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<Response> => {
  const accessToken = await AsyncStorage.getItem("access_token");

  let res = await fetch(`${BACKEND_URL}${url}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // ✅ If access token expired, try ONCE to refresh
  if (res.status === 401) {
    const refreshToken = await AsyncStorage.getItem("refresh_token");

    if (!refreshToken) {
      throw new Error("Session expired");
    }

    const refreshRes = await fetch(`${BACKEND_URL}/user/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    // if (!refreshRes.ok) {
    //   await AsyncStorage.clear();
    //   throw new Error("Session expired");
    // }
    if (!refreshRes.ok) {
      await AsyncStorage.clear();
    //   router.replace("/(auth)/login"); // 🔐 HARD KILL
      throw new Error("Session expired");
    }
    // else{
    //   console.log(refreshRes);
    // }

    const { accessToken: newAccessToken } = await refreshRes.json();
    await AsyncStorage.setItem("access_token", newAccessToken);

    // 🔁 retry original request ONCE
    res = await fetch(`${BACKEND_URL}${url}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${newAccessToken}`,
      },
    });
  }

  return res;
};
