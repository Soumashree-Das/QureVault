
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";

const BACKEND_URL = "http://192.168.0.202:8080";

/* ============================
   Types
   ============================ */

type QRResponse = {
  qr_code?: string;
};

type RouteParams = {
  user_id?: string;
};

/* ============================
   Component
   ============================ */

export default function QRPage() {
  const { user_id } = useLocalSearchParams<RouteParams>();

  // const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState<boolean>(true);


  useEffect(() => {
    if (!user_id) {
      setError("User not found");
      setLoading(false);
      return;
    }

    const fetchQrCode = async (): Promise<void> => {
      try {
        
        const res = await axios.get<QRResponse>(
          `${BACKEND_URL}/patient/getQrCode/${user_id}`
        );

        setQrImage(res.data.qr_code ?? null);
      } catch (err) {
        console.error("QR fetch failed:", err);
        setError("Failed to load QR Code");
      } finally {
        setLoading(false);
      }
    };

    fetchQrCode();
  }, [user_id]);

  /* ============================
     Loading
     ============================ */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={{ marginTop: 10 }}>Loading QR...</Text>
      </View>
    );
  }

  /* ============================
     UI
     ============================ */

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Medical QR Code</Text>

      {error ? (
        <Text style={{ color: "red" }}>{error}</Text>
      ) : qrImage ? (
        <Image
          source={{ uri: qrImage }}
          style={styles.qr}
          resizeMode="contain"
        />
      ) : (
        <Text>No QR Code Found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f9ff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1a73e8",
    marginBottom: 20,
  },
  qr: {
    width: 220,
    height: 220,
  },
});