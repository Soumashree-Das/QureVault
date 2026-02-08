// v1

// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
// } from "react-native";
// import { useRouter } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Picker } from "@react-native-picker/picker";


// const BACKEND_URL = "http://192.168.0.202:8080";

// const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;

// const BLOOD_GROUPS = [
//   "A+",
//   "A-",
//   "B+",
//   "B-",
//   "AB+",
//   "AB-",
//   "O+",
//   "O-",
// ] as const;


// /* ============================
//    Types
//    ============================ */

// type EditProfileForm = {
//   age: string;
//   gender: string;
//   blood_group: string;
// };

// type PatientResponse = {
//   // patient_id?: string;
//   age?: number;
//   gender?: string;
//   blood_group?: string;
// };

// /* ============================
//    Component
//    ============================ */

// const EditProfile = () => {
//   const router = useRouter();

//   const [form, setForm] = useState<EditProfileForm>({
//     age: "",
//     gender: "",
//     blood_group: "",
//   });

//   const [error, setError] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(true);
//   const [saving, setSaving] = useState<boolean>(false);
//   const [patientId, setPatientId] = useState<string | null>(null);

//   /* ============================
//      Load existing profile
//      ============================ */

//   useEffect(() => {
//     loadUserData();
//   }, []);

//   const loadUserData = async (): Promise<void> => {
//     try {
//       const userId = await AsyncStorage.getItem("user_id");

//       if (!userId) {
//         setError("User not logged in.");
//         setLoading(false);
//         return;
//       }

//       const response = await fetch(`${BACKEND_URL}/user/profile/${userId}`);

//       if (!response.ok) {
//         throw new Error("Failed to load profile");
//       }

//       const patientData: PatientResponse = await response.json();
//       console.log("Loaded patient data:", patientData);

//       // if (!patientData.patient_id) {
//       //   throw new Error("Patient ID missing");
//       // }

//       // setPatientId(patientData.patient_id);
//       // await AsyncStorage.setItem("patient_id", patientData.patient_id);
//       const accessToken = await AsyncStorage.getItem("access_token");

//       await fetch(`${BACKEND_URL}/patient/profile`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify({
//           age: Number(form.age),
//           gender: form.gender,
//           blood_group: form.blood_group,
//         }),
//       });

//       setForm({
//         age: patientData.age?.toString() ?? "",
//         gender: patientData.gender ?? "",
//         blood_group: patientData.blood_group ?? "",
//       });
//     } catch (err) {
//       console.error("Error loading user data:", err);
//       setError("Failed to load profile data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ============================
//      Form handlers
//      ============================ */

//   const handleChange = (
//     key: keyof EditProfileForm,
//     value: string
//   ): void => {
//     setForm(prev => ({ ...prev, [key]: value }));
//   };

//   const handleSave = async (): Promise<void> => {
//     setError("");
//     setSaving(true);

//     try {
//       if (!patientId) {
//         setError("Patient ID not found.");
//         return;
//       }

//       const payload = {
//         age: Number(form.age),
//         gender: form.gender,
//         blood_group: form.blood_group,
//       };

//       const response = await fetch(
//         `${BACKEND_URL}/patient/profile/${patientId}`,
//         {
//           method: "PUT",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );

//       const result: { message?: string } = await response.json();

//       if (!response.ok) {
//         setError(result.message ?? "Profile update failed");
//         return;
//       }

//       // Go back to previous screen (Profile tab)
//       router.back();
//     } catch (err) {
//       console.error("Save error:", err);
//       setError("Network or server error");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const imageSource = require("../assets/medical-bg.jpg");

//   /* ============================
//      Loading
//      ============================ */

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#2458a3" />
//         <Text style={styles.loadingText}>Loading profile...</Text>
//       </View>
//     );
//   }

//   /* ============================
//      UI
//      ============================ */

//   return (
//     <View style={{ flex: 1 }}>
//       <Image source={imageSource} style={styles.backgroundImage} />

//       <ScrollView contentContainerStyle={styles.overlay}>
//         <View style={styles.cardBox}>
//           <Text style={styles.header}>Edit Profile</Text>

//           {error ? <Text style={styles.error}>{error}</Text> : null}

//           <TextInput
//             style={styles.input}
//             value={form.age}
//             onChangeText={(text) =>
//               handleChange("age", text.replace(/[^0-9]/g, ""))
//             }
//             placeholder="Age"
//             keyboardType="number-pad"
//             maxLength={3}
//           />

//           {/* <TextInput
//             style={styles.input}
//             placeholder="Gender"
//             value={form.gender}
//             onChangeText={(v) => handleChange("gender", v)}
//           />
//            */}
//           <View style={styles.pickerContainer}>
//             {/* <Picker
//               selectedValue={form.gender}
//               onValueChange={(value) => handleChange("gender", value)}
//             > */}
//             <Picker
//               selectedValue={form.gender}
//               onValueChange={(value) => handleChange("gender", value)}
//               style={{ height: 48 }}
//             >

//               <Picker.Item label="Select Gender" value="" />
//               {GENDER_OPTIONS.map((g) => (
//                 <Picker.Item key={g} label={g} value={g} />
//               ))}
//             </Picker>
//           </View>

//           {/* <TextInput
//             style={styles.input}
//             placeholder="Blood Group"
//             value={form.blood_group}
//             onChangeText={(v) => handleChange("blood_group", v)}
//           /> */}
//           <View style={styles.pickerContainer}>
//             {/* <Picker
//               selectedValue={form.blood_group}
//               onValueChange={(value) => handleChange("blood_group", value)}
//             > */}
//             <Picker
//               selectedValue={form.gender}
//               onValueChange={(value) => handleChange("gender", value)}
//               style={{ height: 48 }}
//             >

//               <Picker.Item label="Select Blood Group" value="" />
//               {BLOOD_GROUPS.map((bg) => (
//                 <Picker.Item key={bg} label={bg} value={bg} />
//               ))}
//             </Picker>
//           </View>

//           <TouchableOpacity
//             style={[styles.button, saving && styles.buttonDisabled]}
//             onPress={handleSave}
//             disabled={saving}
//           >
//             <Text style={styles.buttonText}>
//               {saving ? "Saving..." : "Save Changes"}
//             </Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.button, styles.cancelButton]}
//             onPress={() => router.back()}
//           >
//             <Text style={styles.buttonText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default EditProfile;

// const styles = StyleSheet.create({
//   backgroundImage: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   // pickerContainer: {
//   //   width: "100%",
//   //   borderWidth: 1,
//   //   borderColor: "#c3cfe2",
//   //   borderRadius: 8,
//   //   marginBottom: 12,
//   //   backgroundColor: "#f9fcfe",
//   //   overflow: "hidden",
//   // },
//   pickerContainer: {
//     width: "100%",
//     height: 48,                // 🔑 same as TextInput feel
//     borderWidth: 1,
//     borderColor: "#c3cfe2",
//     borderRadius: 8,
//     marginBottom: 12,
//     backgroundColor: "#f9fcfe",
//     justifyContent: "center",
//   },

//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//     color: '#2458a3',
//   },
//   // overlay: {
//   //   paddingVertical: 30,
//   //   alignItems: 'center',
//   //   backgroundColor: 'rgba(40,85,148,0.10)',
//   // },
//   overlay: {
//     flexGrow: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(40,85,148,0.10)",
//     paddingHorizontal: 16,
//   },

//   cardBox: {
//     backgroundColor: '#fff',
//     padding: 26,
//     borderRadius: 20,
//     width: '88%',
//     shadowColor: '#000',
//     shadowOpacity: 0.06,
//     shadowOffset: { width: 0, height: 4 },
//     shadowRadius: 13,
//     elevation: 7,
//     alignItems: 'center',
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#2458a3',
//     marginBottom: 12,
//     alignSelf: 'center'
//   },
//   error: {
//     color: '#D8000C',
//     marginBottom: 10,
//     fontSize: 15,
//   },
//   // input: {
//   //   width: '100%',
//   //   fontSize: 16,
//   //   borderColor: '#c3cfe2',
//   //   borderWidth: 1,
//   //   borderRadius: 8,
//   //   padding: 10,
//   //   marginBottom: 12,
//   //   backgroundColor: '#f9fcfe',
//   // },
//   input: {
//     width: "100%",
//     height: 48,            // 🔑 match picker
//     fontSize: 16,
//     borderColor: "#c3cfe2",
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     marginBottom: 12,
//     backgroundColor: "#f9fcfe",
//   },
//   fieldLabel: {
//     width: "100%",
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#4a5d73",
//     marginBottom: 6,
//   },

//   button: {
//     backgroundColor: '#1a73e8',
//     borderRadius: 8,
//     paddingVertical: 12,
//     width: '100%',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   buttonDisabled: {
//     backgroundColor: '#a0c4ff',
//   },
//   cancelButton: {
//     backgroundColor: '#6c757d',
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 17,
//   },
// });


//v2
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { apiFetch } from "@/utils/apiFetch";

const BACKEND_URL = "https://qurevault-ver1.onrender.com";
// const BACKEND_URL = "http://192.168.0.202:8080";

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"] as const;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

/* ============================
   Types
   ============================ */

type EditProfileForm = {
  name: string;
  age: string;
  gender: string;
  blood_group: string;
};

type PatientResponse = {
  name?: string;
  age?: number;
  gender?: string;
  blood_group?: string;
};

/* ============================
   Component
   ============================ */

const EditProfile = () => {
  const router = useRouter();

  const [form, setForm] = useState<EditProfileForm>({
    name: "",
    age: "",
    gender: "",
    blood_group: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ============================
     Load existing profile (GET)
     ============================ */

  useEffect(() => {
    fetchProfile();
  }, []);

  // const fetchProfile = async () => {
  //   try {
  //     const accessToken = await AsyncStorage.getItem("access_token");
  //     if (!accessToken) {
  //       setError("Not authenticated. Please login again.");
  //       return;
  //     }

  //     // const res = await fetch(`${BACKEND_URL}/user/profile`, {
  //     //   headers: {
  //     //     Authorization: `Bearer ${accessToken}`,
  //     //   },
  //     // });
  //     // const res = await apiFetch("/patient/records");
  //     // const data = await res.json();
  //     // const res = await apiFetch("/user/profile");

  //     // if (!res.ok) {
  //     //   throw new Error("Failed to load profile");
  //     // }
  //     const res = await apiFetch("/patient/profile", {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     const result = await res.json();

  //     if (!res.ok) {
  //       setError(result.message ?? "Profile update failed");
  //       return;
  //     }

  //     router.back();


  //     const data: PatientResponse = await res.json();

  //     setForm({
  //       age: data.age?.toString() ?? "",
  //       gender: data.gender ?? "",
  //       blood_group: data.blood_group ?? "",
  //     });
  //   } catch (err) {
  //     console.error("Profile load error:", err);
  //     setError("Failed to load profile data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchProfile = async () => {
    try {
      const res = await apiFetch("/user/profile");

      if (!res.ok) {
        throw new Error("Failed to load profile");
      }

      const data: PatientResponse = await res.json();

      setForm({
        name: data.name ?? "",
        age: data.age?.toString() ?? "",
        gender: data.gender ?? "",
        blood_group: data.blood_group ?? "",
      });
    } catch (err) {
      console.error("Profile load error:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };


  /* ============================
     Handlers
     ============================ */

  const handleChange = (key: keyof EditProfileForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // const handleSave = async () => {
  //   setError("");
  //   setSaving(true);

  //   try {
  //     const accessToken = await AsyncStorage.getItem("access_token");
  //     if (!accessToken) {
  //       setError("Not authenticated. Please login again.");
  //       return;
  //     }

  //     const payload = {
  //       age: Number(form.age),
  //       gender: form.gender,
  //       blood_group: form.blood_group,
  //     };

  //     const res = await fetch(`${BACKEND_URL}/patient/profile`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });
  //     // const res = await apiFetch("/patient/records");
  //     // const data = await res.json();


  //     const result = await res.json();

  //     if (!res.ok) {
  //       setError(result.message ?? "Profile update failed");
  //       return;
  //     }

  //     router.back();
  //   } catch (err) {
  //     console.error("Save error:", err);
  //     setError("Network or server error");
  //   } finally {
  //     setSaving(false);
  //   }
  // };
  const handleSave = async () => {
    setError("");
    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        age: Number(form.age),
        gender: form.gender,
        blood_group: form.blood_group,
      };

      const res = await apiFetch("/patient/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message ?? "Profile update failed");
        return;
      }

      router.back();
    } catch (err) {
      console.error("Save error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  const imageSource = require("../assets/medical-bg.jpg");

  /* ============================
     Loading
     ============================ */

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2458a3" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  /* ============================
     UI
     ============================ */

  return (
    <View style={{ flex: 1 }}>
      <Image source={imageSource} style={styles.backgroundImage} />

      <ScrollView contentContainerStyle={styles.overlay}>
        <View style={styles.cardBox}>
          <Text style={styles.header}>Edit Profile</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(text) => handleChange("name", text)}
            placeholder="Full Name"
          />

          <TextInput
            style={styles.input}
            value={form.age}
            onChangeText={(text) =>
              handleChange("age", text.replace(/[^0-9]/g, ""))
            }
            placeholder="Age"
            keyboardType="number-pad"
            maxLength={3}
          />

          {/* Gender */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.gender}
              onValueChange={(value) => handleChange("gender", value)}
            >
              <Picker.Item label="Select Gender" value="" />
              {GENDER_OPTIONS.map((g) => (
                <Picker.Item key={g} label={g} value={g} />
              ))}
            </Picker>
          </View>

          {/* Blood Group */}
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.blood_group}
              onValueChange={(value) => handleChange("blood_group", value)}
            >
              <Picker.Item label="Select Blood Group" value="" />
              {BLOOD_GROUPS.map((bg) => (
                <Picker.Item key={bg} label={bg} value={bg} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? "Saving..." : "Save Changes"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfile;

/* ============================
   Styles
   ============================ */

const styles = StyleSheet.create({
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(40,85,148,0.10)",
    paddingHorizontal: 16,
  },
  cardBox: {
    backgroundColor: "#fff",
    padding: 26,
    borderRadius: 20,
    width: "88%",
    elevation: 7,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2458a3",
    marginBottom: 12,
    textAlign: "center",
  },
  error: {
    color: "#D8000C",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#c3cfe2",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#f9fcfe",
  },
  pickerContainer: {
    width: "100%",
    height: 48,
    borderWidth: 1,
    borderColor: "#c3cfe2",
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: "center",
    backgroundColor: "#f9fcfe",
  },
  button: {
    backgroundColor: "#1a73e8",
    borderRadius: 8,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#a0c4ff",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#2458a3",
  },
});
