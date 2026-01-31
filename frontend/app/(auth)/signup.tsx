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

const BACKEND_URL = "http://192.168.0.202:8080";

/** ---- Types ---- */
type signupForm = {
  name: string;
  email: string;
  password: string;
  role: "patient" | "doctor" | string;
};

const signup: React.FC = () => {
  const router = useRouter();

  const [form, setForm] = useState<signupForm>({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (field: keyof signupForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (): Promise<void> => {
    const { name, email, password } = form;

    if (!name || !email || !password) {
      setError("Please fill all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "signup failed.");
        return;
      }

      alert("Account created successfully!");
      router.replace("/(auth)/login");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
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
          <Text style={styles.title}>Register</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={form.name}
            onChangeText={(v) => handleChange("name", v)}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => handleChange("email", v)}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={form.password}
            onChangeText={(v) => handleChange("password", v)}
          />

          <TextInput
            style={styles.input}
            placeholder="Role (patient or doctor)"
            value={form.role}
            onChangeText={(v) => handleChange("role", v.toLowerCase())}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

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
    backgroundColor: "rgba(40, 85, 148, 0.18)",
  },
  formBox: {
    width: "90%",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 6,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    color: "#2458a3",
    fontWeight: "bold",
    marginBottom: 14,
  },
  error: {
    color: "#D8000C",
    marginBottom: 10,
    fontSize: 15,
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
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
});

export default signup;
