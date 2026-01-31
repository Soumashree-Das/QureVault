import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = "http://192.168.0.202:8080";

export default function Signout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const confirmSignout = async () => {
    setLoading(true);
    let logs: string[] = [];

    try {
      const accessToken = await AsyncStorage.getItem("access_token");
      const refreshToken = await AsyncStorage.getItem("refresh_token");

      // logs.push(`Access token before logout: ${!!accessToken}`);
      // logs.push(`Refresh token before logout: ${!!refreshToken}`);

      // 1️⃣ Call backend signout
      if (accessToken) {
        const res = await fetch(`${BACKEND_URL}/user/signout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        // logs.push(`Backend signout status: ${res.status}`);
      } else {
        logs.push("No access token found, skipping backend signout");
      }

      // 2️⃣ Clear tokens from AsyncStorage
      await AsyncStorage.multiRemove([
        "access_token",
        "refresh_token",
      ]);

      // 3️⃣ Verify storage is cleared
      const checkAccess = await AsyncStorage.getItem("access_token");
      const checkRefresh = await AsyncStorage.getItem("refresh_token");

      // logs.push(`Access token after logout: ${checkAccess}`);
      // logs.push(`Refresh token after logout: ${checkRefresh}`);

      setDebugInfo(logs.join("\n"));

      // 4️⃣ Hard redirect
      setTimeout(() => {
        router.replace("/(auth)/login");
      }, 1500);

    } catch (err) {
      console.error("Signout error:", err);
      Alert.alert("Error", "Something went wrong while signing out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign out</Text>

      <Text style={styles.message}>
        Are you sure you want to sign out?
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#dc3545" />
      ) : (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={confirmSignout}
        >
          <Text style={styles.confirmText}>Confirm Sign out</Text>
        </TouchableOpacity>
      )}

      {debugInfo ? (
        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>Debug</Text>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
    color: "#212529",
  },

  message: {
    fontSize: 16,
    color: "#495057",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },

  confirmButton: {
    backgroundColor: "#dc3545", // destructive red
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    minWidth: 220,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  confirmText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  debugBox: {
    marginTop: 32,
    padding: 16,
    width: "100%",
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },

  debugTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#212529",
  },

  debugText: {
    fontSize: 13,
    color: "#495057",
    lineHeight: 18,
  },
});
