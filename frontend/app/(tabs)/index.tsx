// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
// } from "react-native";
// import { useRouter } from "expo-router";

// const index: React.FC = () => {
//   const router = useRouter();

//   return (
//     <View style={styles.container}>
//       <Image
//         source={require("../../assets/medical-bg.jpg")}
//         style={styles.backgroundImage}
//         resizeMode="cover"
//       />

//       <View style={styles.overlay}>
//         <View style={styles.box}>
//           <Text style={styles.title}>Welcome to QureVault</Text>

//           <Text style={styles.subtitle}>
//             Your Digital Health Twin for Modern Healthcare
//           </Text>

//           <TouchableOpacity
//             style={styles.primaryButton}
//             onPress={() => router.push("/(auth)/signup")}
//             activeOpacity={0.85}
//           >
//             <Text style={styles.primaryButtonText}>Sign Up</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.secondaryButton}
//             onPress={() => router.push("/(auth)/login")}
//             activeOpacity={0.85}
//           >
//             <Text style={styles.secondaryButtonText}>Log In</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// };

// export default index;
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Index: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  };

  if (isLoggedIn === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/medical-bg.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.overlay}>
        <View style={styles.box}>
          {!isLoggedIn ? (
            <>
              <Text style={styles.title}>Welcome to QureVault</Text>
              <Text style={styles.subtitle}>
                Your Digital Health Twin for Modern Healthcare
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push("/(auth)/signup")}
              >
                <Text style={styles.primaryButtonText}>Sign Up</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push("/(auth)/login")}
              >
                <Text style={styles.secondaryButtonText}>Log In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Welcome Back 👋</Text>

              <Text style={styles.subtitle}>
                “Your health is your greatest wealth.”
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.replace("/(tabs)/profile")}
              >
                <Text style={styles.primaryButtonText}>
                  Explore Dashboard
                </Text>
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={styles.secondaryButton}
                onPress={async () => {
                  await AsyncStorage.removeItem("access_token");
                  await AsyncStorage.removeItem("refresh_token");
                  setIsLoggedIn(false);
                }}
              >
                <Text style={styles.secondaryButtonText}>Logout</Text>
              </TouchableOpacity> */}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default Index;


/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  box: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 24,
    borderRadius: 16,
    width: "85%",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },

  primaryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    width: "100%",
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    paddingVertical: 12,
    width: "100%",
    borderRadius: 25,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },

  //temp
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

});

