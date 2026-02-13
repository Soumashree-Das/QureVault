import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = "https://qurevault-ver1.onrender.com";
// const BACKEND_URL = "http://192.168.0.202:8080";

/* ============================
   Types
   ============================ */

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  message?: string;
};


/* ============================
   Component
   ============================ */

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (): Promise<void> => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/user/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMsg = "Login failed";

        try {
          const errorData: { message?: string } = await response.json();
          errorMsg = errorData.message ?? errorMsg;
        } catch {
          const textErr = await response.text();
          errorMsg = textErr || errorMsg;
        }

        setError(errorMsg);
        return;
      }

      const data: LoginResponse = await response.json();
      // console.log("Login successful:", data);//check what data is receuved form backend

      if (data?.accessToken && data?.refreshToken) {
        await AsyncStorage.setItem("access_token", data.accessToken);
        await AsyncStorage.setItem("refresh_token", data.refreshToken);

        router.replace("/(tabs)");
      } else {
        setError("Invalid response from server");
      }
      // console.log("STORED ACCESS:", await AsyncStorage.getItem("access_token"));
      // console.log("STORED REFRESH:", await AsyncStorage.getItem("refresh_token"));


    } catch (err) {
      console.error("Network error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const imageSource = require("../../assets/medical-bg.jpg");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Image source={imageSource} style={styles.backgroundImage} />

      <View style={styles.overlay}>
        <View style={styles.formBox}>
          <Text style={styles.title}>Login</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            textContentType="password"
            editable={!loading}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.push("/(auth)/signup")}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              Don&apos;t have an account? Register
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.replace("/(tabs)")}
      >
        <Text style={styles.secondaryText}>Go to Home</Text>
      </TouchableOpacity>

      </View>
      
    </KeyboardAvoidingView>
  );
};

// export default Login;

const styles = StyleSheet.create({
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(40,85,148,0.18)",
  },
  formBox: {
    width: "88%",
    padding: 22,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    color: "#2458a3",
    fontWeight: "bold",
    marginBottom: 12,
  },
  error: {
    color: "#D8000C",
    marginBottom: 8,
    fontSize: 15,
    textAlign: "center",
  },
  input: {
    width: "100%",
    fontSize: 16,
    borderColor: "#c3cfe2",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "#f9fcfe",
  },
  button: {
    backgroundColor: "#2458a3",
    borderRadius: 8,
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
  link: {
    marginTop: 14,
  },
  linkText: {
    color: "#2458a3",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  secondaryButton: {
    width: "80%",
    backgroundColor: "#e7f1ff",
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0d6efd",
    alignItems: "center",
  },

  secondaryText: {
    color: "#0d6efd",
    fontSize: 16,
    fontWeight: "600",
  },

});

export default Login;

