import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "@/utils/apiFetch";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

const BACKEND_URL = "https://qurevault-ver1.onrender.com";
// const BACKEND_URL = "http://192.168.0.202:8080";

/* ===========================
   Types
   =========================== */

type Patient = {
  name?: string;
  age?: number;
  gender?: string;
  blood_group?: string;
  patient_id?: string;
  user_id?: string;
};

type QRResponse = {
  qr_code?: string;
};

/* ===========================
   Component
   =========================== */

export default function Profile() {
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState<boolean>(true);

  /* ===========================
     Fetch profile + QR
     =========================== */
const guard = async () => {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        router.replace("/(auth)/login");
        return;
      }

      fetchPatientData();
      fetchQrCode();
    };
  // useEffect(() => {
    

  //   guard();
  // }, []);
  useFocusEffect(
  useCallback(() => {
    let isActive = true;

    const guard = async () => {
      const isLoggingOut = await AsyncStorage.getItem("LOGGING_OUT");
      if (isLoggingOut === "true") return;

      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        router.replace("/(auth)/login");
        return;
      }

      if (isActive) {
        fetchPatientData();
        fetchQrCode();
      }
    };

    guard();

    return () => {
      isActive = false;
    };
  }, [])
);

  const fetchPatientData = async (): Promise<void> => {
    try {
      setLoading(true);

      const res = await apiFetch("/user/profile");

      if (!res.ok) {
        throw new Error("FAILED_PROFILE");
      }

      const data: Patient = await res.json();
      console.log("profile page in frontend loding patient data from backend",data);
      setPatient(data);

    } catch (err: any) {
      console.error(err);

      if (err.message === "SESSION_EXPIRED") {
        setPatient(null);
        router.replace("/(auth)/login");
        return;
      }

      setPatient(null);
      setError("Failed to load profile");

    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     Fetch QR
     =========================== */

  const fetchQrCode = async (): Promise<void> => {
    try {
      setQrLoading(true);

      const res = await apiFetch("/patient/getQrCode");

      if (!res.ok) {
        throw new Error("FAILED_QR");
      }

      const data: QRResponse = await res.json();
      setQrImage(data.qr_code ?? null);

    } catch (err: any) {
      console.error(err);

      if (err.message === "SESSION_EXPIRED") {
        setQrImage(null);
        return;
      }

      setQrImage(null);
    } finally {
      setQrLoading(false);
    }
  };

  /* ===========================
     Logout
     =========================== */

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');

      const accessToken = await AsyncStorage.getItem('access_token');
      console.log('Access token found:', !!accessToken);

      if (accessToken) {
        // Call backend signout API
        try {
          console.log('Calling backend signout API...');
          const response = await fetch(`${BACKEND_URL}/user/signout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
          });

          console.log('Backend response status:', response.status);

          if (response.ok) {
            console.log('Backend signout successful');
          } else {
            console.warn('Backend signout failed, proceeding with local logout');
          }
        } catch (apiError) {
          console.error('API call failed:', apiError);
        }
      }

      // Clear local storage
      console.log('Clearing AsyncStorage...');
      await AsyncStorage.multiRemove([
        'access_token',
        'refresh_token',
        'user_id',
      ]);

      // Verify storage is cleared
      const check = await AsyncStorage.getItem('access_token');
      console.log('Token after clearing:', check);
      console.log('Storage cleared successfully');

      // Reset state
      setPatient(null);
      setQrImage(null);

      // Navigate to login
      console.log('Navigating to login...');
      router.replace('/(auth)/login');

    } catch (error) {
      console.error('Logout error:', error);

      // Force clear and navigate
      try {
        await AsyncStorage.clear();
        setPatient(null);
        setQrImage(null);
      } catch (clearError) {
        console.error('Error clearing storage:', clearError);
      }

      router.replace('/(auth)/login');
    }
  };
  
  /* ===========================
     Loading
     =========================== */

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0d6efd" />
      </View>
    );
  }

  /* ===========================
     UI
     =========================== */

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("../../assets/medical-bg.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* PROFILE CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Profile</Text>

        <ProfileRow label="Name" value={patient?.name} />
        <ProfileRow label="Age" value={patient?.age} />
        <ProfileRow label="Gender" value={patient?.gender} />
        <ProfileRow label="Blood Group" value={patient?.blood_group} />
        <ProfileRow label="Patient ID" value={patient?.patient_id} />

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/EditProfile")}
        >
          <Text style={styles.btnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* QR CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your QR Code</Text>

        <View style={styles.qrBox}>
          {qrLoading ? (
            <ActivityIndicator size="large" color="#0d6efd" />
          ) : qrImage ? (
            <Image
              source={{ uri: qrImage }}
              style={styles.qr}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.mutedText}>QR not available</Text>
          )}
        </View>

        {/* <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={async () => {
            const userId = await AsyncStorage.getItem("user_id");
            router.push({
              pathname: "/qr",
              params: { user_id: userId ?? "" },
            });
          }}
        >
          <Text style={styles.secondaryText}>Open Fullscreen QR</Text>
        </TouchableOpacity> */}
      </View>

      {/* ACTIONS */}
      <TouchableOpacity
        style={styles.outlineBtn}
        onPress={async () => {
          const userId = await AsyncStorage.getItem("user_id");
          router.push({
            pathname: "/ReportsPage",
            params: { user_id: userId ?? "" },
          });
        }}
      >
        <Text style={styles.outlineText}>View Reports</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.push("/(auth)/signout")}
        activeOpacity={0.7}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

/* ===========================
   Reusable Row
   =========================== */

const ProfileRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value ?? "N/A"}</Text>
  </View>
);

/* ===========================
   Styles
   =========================== */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f4f6f8",
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    color: "#6c757d",
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: "#0d6efd",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  secondaryBtn: {
    backgroundColor: "#e7f1ff",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#0d6efd",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  logoutBtn: {
    backgroundColor: "#dc3545",
    padding: 14,
    borderRadius: 10,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  secondaryText: {
    color: "#0d6efd",
    textAlign: "center",
    fontWeight: "600",
  },
  outlineText: {
    color: "#0d6efd",
    textAlign: "center",
    fontWeight: "600",
  },
  mutedText: {
    color: "#6c757d",
  },
  qrBox: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  qr: {
    width: 180,
    height: 180,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


// // logout not working
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { useRouter } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { apiFetch } from "@/utils/apiFetch";

// const BACKEND_URL = "http://192.168.0.202:8080";

// /* ===========================
//    Types
//    =========================== */

// type Patient = {
//   name?: string;
//   age?: number;
//   gender?: string;
//   blood_group?: string;
//   patient_id?: string;
//   user_id?: string;
// };

// type QRResponse = {
//   qr_code?: string;
// };

// /* ===========================
//    Component
//    =========================== */

// export default function profile() {
//   const router = useRouter();

//   const [patient, setPatient] = useState<Patient | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>("");

//   const [qrImage, setQrImage] = useState<string | null>(null);
//   const [qrLoading, setQrLoading] = useState<boolean>(true);

//   /* ===========================
//      Fetch profile + QR
//      =========================== */

//   useEffect(() => {
//     const guard = async () => {
//       const token = await AsyncStorage.getItem("access_token");
//       if (!token) {
//         router.replace("/(auth)/login");
//         return;
//       }

//       fetchPatientData();
//       fetchQrCode();
//     };

//     guard();
//   }, []);

//   const fetchPatientData = async (): Promise<void> => {
//     try {
//       setLoading(true);

//       const res = await apiFetch("/user/profile");

//       if (!res.ok) {
//         throw new Error("FAILED_pROFILE");
//       }

//       const data: Patient = await res.json();
//       setPatient(data);

//     } catch (err: any) {
//       console.error(err);

//       if (err.message === "SESSION_EXPIRED") {
//         setPatient(null);
//         router.replace("/(auth)/login");
//         return;
//       }

//       setPatient(null);
//       setError("Failed to load profile");

//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ===========================
//      Fetch QR
//      =========================== */

//   const fetchQrCode = async (): Promise<void> => {
//     try {
//       setQrLoading(true);

//       const res = await apiFetch("/patient/getQrCode");

//       if (!res.ok) {
//         throw new Error("FAILED_QR");
//       }

//       const data: QRResponse = await res.json();
//       setQrImage(data.qr_code ?? null);

//     } catch (err: any) {
//       console.error(err);

//       if (err.message === "SESSION_EXPIRED") {
//         setQrImage(null);
//         return;
//       }

//       setQrImage(null);
//     } finally {
//       setQrLoading(false);
//     }
//   };

//   /* ===========================
//      Logout
//      =========================== */

//   const handleLogoutPress = () => {
//     // Alert.alert(
//     //   'Logout',
//     //   'Are you sure you want to logout?',
//     //   [
//     //     {
//     //       text: 'Cancel',
//     //       style: 'cancel',
//     //     },
//     //     {
//     //       text: 'Logout',
//     //       style: 'destructive',
//     //       onPress: () => {
//     //         router.replace('/(auth)/logout');
//     //       },
//     //     },
//     //   ],
//     //   { cancelable: true }
//     // );

//     const logout = async () => {
//   await AsyncStorage.multiRemove([
//     "access_token",
//     "refresh_token",
//     "user_id",
//   ]);
//   console.log("Logging out!");
//   logout();
//   console.log("Logged out!");

//   router.replace("/(auth)/login");
// };

//   };

//   if (!patient && !loading) {
//     return null;
//   }

//   /* ===========================
//      Loading
//      =========================== */

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#0d6efd" />
//       </View>
//     );
//   }

//   /* ===========================
//      UI
//      =========================== */

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Image
//         source={require("../../assets/medical-bg.jpg")}
//         style={styles.backgroundImage}
//         resizeMode="cover"
//       />

//       {/* pROFILE CARD */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Your profile</Text>

//         <ProfileRow label="Name" value={patient?.name} />
//         <ProfileRow label="Age" value={patient?.age} />
//         <ProfileRow label="Gender" value={patient?.gender} />
//         <ProfileRow label="Blood Group" value={patient?.blood_group} />
//         <ProfileRow label="Patient ID" value={patient?.patient_id} />

//         <TouchableOpacity
//           style={styles.primaryBtn}
//           onPress={() => router.push("/EditProfile")}
//         >
//           <Text style={styles.btnText}>Edit profile</Text>
//         </TouchableOpacity>
//       </View>

//       {/* QR CARD */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Your QR Code</Text>

//         <View style={styles.qrBox}>
//           {qrLoading ? (
//             <ActivityIndicator size="large" color="#0d6efd" />
//           ) : qrImage ? (
//             <Image
//               source={{ uri: qrImage }}
//               style={styles.qr}
//               resizeMode="contain"
//             />
//           ) : (
//             <Text style={styles.mutedText}>QR not available</Text>
//           )}
//         </View>

//         <TouchableOpacity
//           style={styles.secondaryBtn}
//           onPress={async () => {
//             const userId = await AsyncStorage.getItem("user_id");
//             router.push({
//               pathname: "/qr",
//               params: { user_id: userId ?? "" },
//             });
//           }}
//         >
//           <Text style={styles.secondaryText}>Open Fullscreen QR</Text>
//         </TouchableOpacity>
//       </View>

//       {/* ACTIONS */}
//       <TouchableOpacity
//         style={styles.outlineBtn}
//         onPress={async () => {
//           const userId = await AsyncStorage.getItem("user_id");
//           router.push({
//             pathname: "/ReportsPage",
//             params: { user_id: userId ?? "" },
//           });
//         }}
//       >
//         <Text style={styles.outlineText}>View Reports</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.logoutButton}
//         onPress={handleLogoutPress}
//         activeOpacity={0.7}
//       >
//         <Text style={styles.logoutButtonText}>Logout</Text>
//       </TouchableOpacity>

//       {error ? <Text style={styles.error}>{error}</Text> : null}
//     </ScrollView>
//   );
// }

// /* ===========================
//    Reusable Row
//    =========================== */

// const ProfileRow = ({
//   label,
//   value,
// }: {
//   label: string;
//   value?: string | number;
// }) => (
//   <View style={styles.row}>
//     <Text style={styles.label}>{label}</Text>
//     <Text style={styles.value}>{value ?? "N/A"}</Text>
//   </View>
// );

// /* ===========================
//    Styles
//    =========================== */

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: "#f4f6f8",
//   },
//   backgroundImage: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     width: "100%",
//     height: "100%",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 12,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   label: {
//     color: "#6c757d",
//     fontSize: 14,
//   },
//   value: {
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   primaryBtn: {
//     backgroundColor: "#0d6efd",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 16,
//   },
//   secondaryBtn: {
//     backgroundColor: "#e7f1ff",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 12,
//   },
//   outlineBtn: {
//     borderWidth: 1,
//     borderColor: "#0d6efd",
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 12,
//   },
//   logoutBtn: {
//     backgroundColor: "#dc3545",
//     padding: 14,
//     borderRadius: 10,
//   },
//   btnText: {
//     color: "#fff",
//     textAlign: "center",
//     fontWeight: "600",
//   },
//   secondaryText: {
//     color: "#0d6efd",
//     textAlign: "center",
//     fontWeight: "600",
//   },
//   outlineText: {
//     color: "#0d6efd",
//     textAlign: "center",
//     fontWeight: "600",
//   },
//   mutedText: {
//     color: "#6c757d",
//   },
//   qrBox: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginVertical: 12,
//   },
//   qr: {
//     width: 180,
//     height: 180,
//   },
//   error: {
//     color: "red",
//     textAlign: "center",
//     marginTop: 10,
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   logoutButton: {
//     backgroundColor: '#FF3B30',
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 'auto',
//     marginBottom: 20,
//   },
//   logoutButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });


















// // original extensive code
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { apiFetch } from "@/utils/apiFetch";
// // import { logout } from "../(auth)/logout";

// const BACKEND_URL = "http://192.168.0.202:8080";

// /* ===========================
//    Types
//    =========================== */

// type Patient = {
//   name?: string;
//   age?: number;
//   gender?: string;
//   blood_group?: string;
//   patient_id?: string;
//   user_id?: string;
// };

// type QRResponse = {
//   qr_code?: string;
// };

// /* ===========================
//    Component
//    =========================== */

// export default function profile() {
//   const router = useRouter();
//   // const params = useLocalSearchParams<{ userId?: string; refresh?: string }>();

//   const [patient, setPatient] = useState<Patient | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>("");

//   const [qrImage, setQrImage] = useState<string | null>(null);
//   const [qrLoading, setQrLoading] = useState<boolean>(true);

//   // const [patient, setPatient] = useState<Patient | null>(null);


//   /* ===========================
//      Fetch profile + QR
//      =========================== */

//   // useEffect(() => {
//   //   fetchPatientData();
//   //   fetchQrCode();
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, []);


//   useEffect(() => {
//     const guard = async () => {
//       const token = await AsyncStorage.getItem("access_token");
//       if (!token) {
//         router.replace("/(auth)/login");
//         return;
//       }

//       // only fetch if authenticated
//       fetchPatientData();
//       fetchQrCode();
//     };

//     guard();
//   }, []);

//   // // v1
//   // const fetchPatientData = async (): Promise<void> => {
//   //   try {
//   //     // let userId = params.userId;

//   //     // if (!userId) {
//   //     //   userId = (await AsyncStorage.getItem("user_id")) ?? undefined;
//   //     // }

//   //     // if (!userId) {
//   //     //   setError("User not found. Please login again.");
//   //     //   return;
//   //     // }

//   //     // const accessToken = await AsyncStorage.getItem("access_token");

//   //     // const res = await fetch(`${BACKEND_URL}/user/profile`, {
//   //     //   headers: {
//   //     //     Authorization: `Bearer ${accessToken}`,
//   //     //   },
//   //     // });
//   //     const res = await apiFetch("/user/profile");

//   //     if (!res.ok) {
//   //       throw new Error("Failed to load profile");
//   //     }

//   //     const data: Patient = await res.json();
//   //     setPatient(data);



//   //     // const data: Patient = await res.json();

//   //     setPatient(data);
//   //   } catch (err) {
//   //     console.error(err);
//   //     setError("Failed to load profile");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   // v2
//   const fetchPatientData = async (): Promise<void> => {
//     try {
//       setLoading(true);

//       const res = await apiFetch("/user/profile");

//       if (!res.ok) {
//         throw new Error("FAILED_pROFILE");
//       }

//       const data: Patient = await res.json();
//       setPatient(data);

//     } catch (err: any) {
//       console.error(err);

//       // 🔐 session truly expired
//       if (err.message === "SESSION_EXPIRED") {
//         setPatient(null);
//         router.replace("/(auth)/login");
//         return;
//       }

//       setPatient(null);
//       setError("Failed to load profile");

//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ===========================
//      Fetch QR
//      =========================== */
//   //    // v1


//   // const fetchQrCode = async (): Promise<void> => {
//   //   try {
//   //     // const userId = await AsyncStorage.getItem("user_id");
//   //     // if (!userId) return;
//   //     // const accessToken = await AsyncStorage.getItem("access_token");

//   //     // const res = await fetch(`${BACKEND_URL}/patient/getQrCode`, {
//   //     //   headers: {
//   //     //     Authorization: `Bearer ${accessToken}`,
//   //     //   },
//   //     // });
//   //     // // const res = await apiFetch("/patient/records");
//   //     // // const data = await res.json();


//   //     const res = await apiFetch("/patient/getQrCode");

//   //     if (!res.ok) {
//   //       throw new Error("Failed to fetch QR");
//   //     }

//   //     const data: QRResponse = await res.json();
//   //     setQrImage(data.qr_code ?? null);

//   //     // const data: QRResponse = await res.json();

//   //     setQrImage(data.qr_code ?? null);
//   //   } catch (err) {
//   //     console.error("QR fetch failed:", err);
//   //   } finally {
//   //     setQrLoading(false);
//   //   }
//   // };

//   // v2
//   const fetchQrCode = async (): Promise<void> => {
//     try {
//       setQrLoading(true);

//       const res = await apiFetch("/patient/getQrCode");

//       if (!res.ok) {
//         throw new Error("FAILED_QR");
//       }

//       const data: QRResponse = await res.json();
//       setQrImage(data.qr_code ?? null);

//     } catch (err: any) {
//       console.error(err);

//       if (err.message === "SESSION_EXPIRED") {
//         setQrImage(null);
//         return;
//       }

//       setQrImage(null);
//     } finally {
//       setQrLoading(false);
//     }
//   };

//   /* ===========================
//      Logout
//      =========================== */
//   // const handleLogout = (): void => {
//   //   Alert.alert("Logout", "Are you sure you want to logout?", [
//   //     { text: "Cancel", style: "cancel" },
//   //     {
//   //       text: "Logout",
//   //       style: "destructive",
//   //       onPress: async () => {
//   //         await logout();
//   //       },
//   //     },
//   //   ]);
//   // };
//   const handleLogoutPress = () => {
//     Alert.alert(
//       'Logout',
//       'Are you sure you want to logout?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Logout',
//           style: 'destructive',
//           onPress: () => {
//             // Navigate to the logout screen
//             router.push('/(auth)/logout');
//           },
//         },
//       ],
//       { cancelable: true }
//     );
//   };

//   if (!patient && !loading) {
//     return null; // nothing is rendered
//   }


//   /* ===========================
//      Loading
//      =========================== */

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#0d6efd" />
//       </View>
//     );
//   }

//   /* ===========================
//      UI
//      =========================== */

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Image
//         source={require("../../assets/medical-bg.jpg")}
//         style={styles.backgroundImage}
//         resizeMode="cover"
//       />
//       {/* pROFILE CARD */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Your profile</Text>

//         <ProfileRow label="Name" value={patient?.name} />
//         <ProfileRow label="Age" value={patient?.age} />
//         <ProfileRow label="Gender" value={patient?.gender} />
//         <ProfileRow label="Blood Group" value={patient?.blood_group} />
//         <ProfileRow label="Patient ID" value={patient?.patient_id} />

//         <TouchableOpacity
//           style={styles.primaryBtn}
//           onPress={() => router.push("/EditProfile")}
//         >
//           <Text style={styles.btnText}>Edit profile</Text>
//         </TouchableOpacity>
//       </View>

//       {/* QR CARD */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Your QR Code</Text>

//         <View style={styles.qrBox}>
//           {qrLoading ? (
//             <ActivityIndicator size="large" color="#0d6efd" />
//           ) : qrImage ? (
//             <Image
//               source={{ uri: qrImage }}
//               style={styles.qr}
//               resizeMode="contain"
//             />
//           ) : (
//             <Text style={styles.mutedText}>QR not available</Text>
//           )}
//         </View>

//         <TouchableOpacity
//           style={styles.secondaryBtn}
//           onPress={async () => {
//             const userId = await AsyncStorage.getItem("user_id");
//             router.push({
//               pathname: "/qr",
//               params: { user_id: userId ?? "" },
//             });
//           }}
//         >
//           <Text style={styles.secondaryText}>Open Fullscreen QR</Text>
//         </TouchableOpacity>
//       </View>

//       {/* ACTIONS */}
//       <TouchableOpacity
//         style={styles.outlineBtn}
//         onPress={async () => {
//           const userId = await AsyncStorage.getItem("user_id");
//           router.push({
//             pathname: "/ReportsPage",
//             params: { user_id: userId ?? "" },
//           });
//         }}
//       >
//         <Text style={styles.outlineText}>View Reports</Text>
//       </TouchableOpacity>

//       {/* <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
//         <Text style={styles.btnText}>Logout</Text>
//       </TouchableOpacity> */}

//       {/* <TouchableOpacity
//         onPress={() => {
//           console.log("LOGOUT BUTTON PRESSED");
//           //  Alert.alert("Test", "Alert is working");
//           router.push("/logout");
//         }}
//       >
//         <Text>Logout</Text>
//       </TouchableOpacity> */}
// <TouchableOpacity
//         style={styles.logoutButton}
//         onPress={handleLogoutPress}
//         activeOpacity={0.7}
//       >
//         <Text style={styles.logoutButtonText}>Logout</Text>
//       </TouchableOpacity>

//       {/* <TouchableOpacity onPress={() => router.push("/(auth)/logout")}>
//         <Text style={{ color: "red", fontWeight: "600" }}>Logout</Text>
//       </TouchableOpacity> */}

//       {error ? <Text style={styles.error}>{error}</Text> : null}
//     </ScrollView>
//   );
// }

// /* ===========================
//    Reusable Row
//    =========================== */

// const ProfileRow = ({
//   label,
//   value,
// }: {
//   label: string;
//   value?: string | number;
// }) => (
//   <View style={styles.row}>
//     <Text style={styles.label}>{label}</Text>
//     <Text style={styles.value}>{value ?? "N/A"}</Text>
//   </View>
// );

// /* ===========================
//    Styles
//    =========================== */

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: "#f4f6f8",
//   },
//   backgroundImage: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     width: "100%",
//     height: "100%",
//   },
//   card: {
//     backgroundColor: "#fff",
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 12,
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 8,
//   },
//   label: {
//     color: "#6c757d",
//     fontSize: 14,
//   },
//   value: {
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   primaryBtn: {
//     backgroundColor: "#0d6efd",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 16,
//   },
//   secondaryBtn: {
//     backgroundColor: "#e7f1ff",
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 12,
//   },
//   outlineBtn: {
//     borderWidth: 1,
//     borderColor: "#0d6efd",
//     padding: 14,
//     borderRadius: 10,
//     marginBottom: 12,
//   },
//   logoutBtn: {
//     backgroundColor: "#dc3545",
//     padding: 14,
//     borderRadius: 10,
//   },
//   btnText: {
//     color: "#fff",
//     textAlign: "center",
//     fontWeight: "600",
//   },
//   secondaryText: {
//     color: "#0d6efd",
//     textAlign: "center",
//     fontWeight: "600",
//   },
//   outlineText: {
//     color: "#0d6efd",
//     textAlign: "center",
//     fontWeight: "600",
//   },
//   mutedText: {
//     color: "#6c757d",
//   },
//   qrBox: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginVertical: 12,
//   },
//   qr: {
//     width: 180,
//     height: 180,
//   },
//   error: {
//     color: "red",
//     textAlign: "center",
//     marginTop: 10,
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//    logoutButton: {
//     backgroundColor: '#FF3B30',
//     paddingVertical: 14,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 'auto',
//     marginBottom: 20,
//   },
//   logoutButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });
