import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Upload: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // 🔒 Auth guard (runs every time screen is focused)
  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        setIsLoggedIn(!!refreshToken);
      };

      checkAuth();
    }, [])
  );

  const requireLogin = () => {
    router.push("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/medical-bg.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <Text style={styles.title}>Upload Medical Documents</Text>

      {/* 🔔 Message when logged out */}
      {!isLoggedIn && (
        <View style={styles.guardBox}>
          <Text style={styles.guardText}>
            You need to login to upload documents.
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={requireLogin}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Upload Prescription */}
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          isLoggedIn
            ? router.push("/UploadPrescription")
            : requireLogin()
        }
      >
        <Text style={styles.buttonText}>Upload Prescription</Text>
      </TouchableOpacity>

      {/* Upload Report */}
      <TouchableOpacity
        style={[styles.button, styles.secondary]}
        onPress={() =>
          isLoggedIn
            ? router.push("/UploadReport")
            : requireLogin()
        }
      >
        <Text style={styles.buttonText}>Upload Medical Report</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Upload;



// v2-> working not gaurded if not logged out
// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image, // ✅ missing import fixed
// } from "react-native";
// import { useRouter } from "expo-router";

// const Upload: React.FC = () => { // ✅ PascalCase
//   const router = useRouter();

//   return (
//     <View style={styles.container}>
//       <Image
//         source={require("../../assets/medical-bg.jpg")}
//         style={styles.backgroundImage}
//         resizeMode="cover"
//       />

//       <Text style={styles.title}>Upload Medical Documents</Text>

//       <TouchableOpacity
//         style={styles.button}
//         onPress={() => router.push("/UploadPrescription")}
//       >
//         <Text style={styles.buttonText}>Upload Prescription</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.button, styles.secondary]}
//         onPress={() => router.push("/UploadReport")}
//       >
//         <Text style={styles.buttonText}>Upload Medical Report</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default Upload;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 30,
    color: "#000",
  },
  button: {
    width: "90%",
    backgroundColor: "#1a73e8",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  secondary: {
    backgroundColor: "#28a745",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  guardBox: {
    width: "90%",
    backgroundColor: "#fff3cd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#ffeeba",
  },

  guardText: {
    color: "#856404",
    fontSize: 15,
    marginBottom: 12,
    textAlign: "center",
  },

  loginButton: {
    backgroundColor: "#0d6efd",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  loginButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

});


// v1
// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
// } from "react-native";
// import { useRouter } from "expo-router";

// const upload: React.FC = () => {
//   const router = useRouter();

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Upload Medical Documents</Text>

//       <TouchableOpacity
//         style={styles.button}
//         onPress={() => router.push("/UploadPrescription")}
//       >
//         <Text style={styles.buttonText}>Upload Prescription</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={[styles.button, styles.secondary]}
//         onPress={() => router.push("/UploadReport")}
//       >
//         <Text style={styles.buttonText}>Upload Medical Report</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default upload;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f9f9f9",
//     padding: 20,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 30,
//   },
//   button: {
//     width: "90%",
//     backgroundColor: "#1a73e8",
//     paddingVertical: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   secondary: {
//     backgroundColor: "#28a745",
//   },
//   buttonText: {
//     color: "#fff",
//     fontSize: 17,
//     fontWeight: "600",
//   },
// });
