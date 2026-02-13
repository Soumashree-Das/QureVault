// // v2->auth based
// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Platform,
//   Alert,
//   ScrollView,
//   TextInput,
// } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import { useLocalSearchParams } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { apiFetch } from "@/utils/apiFetch";

// /* ------------------ Config ------------------ */

// const SERVER_URL = "http://192.168.0.202:8080";

// /* ------------------ Types ------------------ */

// type DateSource = "ocr" | "manual";

// type PickedFile = DocumentPicker.DocumentPickerAsset | null;

// interface OcrPreviewResponse {
//   dateSuggestion?: {
//     dates?: string[];
//     reason?: string;
//   };
// }

// /* ------------------ Component ------------------ */

// const UploadPrescription: React.FC = () => {
//   const params = useLocalSearchParams<{ userId?: string }>();

//   const [selectedFile, setSelectedFile] = useState<PickedFile>(null);
//   const [uploading, setUploading] = useState<boolean>(false);
//   const [ocrLoading, setOcrLoading] = useState<boolean>(false);

//   const [prescriptionName, setPrescriptionName] = useState<string>("");
//   const [suggestedDate, setSuggestedDate] = useState<string>("");
//   const [dateSource, setDateSource] = useState<DateSource>("ocr");
//   const [showForm, setShowForm] = useState<boolean>(false);
//   const [dateReason, setDateReason] = useState<string>("");

//   /* ------------------ Handlers ------------------ */

//   const handleChooseFile = async (): Promise<void> => {
//     try {
//       const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });

//       if (!res.canceled && res.assets?.length) {
//         const file = res.assets[0];
//         setSelectedFile(file);
//         await runOcrPreview(file);
//       }
//     } catch {
//       Alert.alert("Error", "Could not open file picker.");
//     }
//   };

//   const runOcrPreview = async (
//     file: DocumentPicker.DocumentPickerAsset
//   ): Promise<void> => {
//     try {
//       setOcrLoading(true);

//       const formData = new FormData();

//       if (Platform.OS === "web") {
//         const response = await fetch(file.uri);
//         const blob = await response.blob();
//         formData.append("file", blob, file.name);
//       } else {
//         formData.append("file", {
//           uri: file.uri,
//           type: file.mimeType ?? "application/octet-stream",
//           name: file.name ?? "prescription.jpg",
//         } as any);
//       }

//       const res = await fetch(`${SERVER_URL}/patient/ocr-preview`, {
//         method: "POST",
//         body: formData,
//       });

//       const data: OcrPreviewResponse = await res.json();

//       if (res.ok) {
//         setSuggestedDate(data.dateSuggestion?.dates?.[0] ?? "");
//         setDateReason(data.dateSuggestion?.reason ?? "");
//         setShowForm(true);
//       } else {
//         Alert.alert("OCR Error", "Could not extract date");
//       }
//     } catch {
//       Alert.alert("Error", "OCR failed");
//     } finally {
//       setOcrLoading(false);
//     }
//   };

//   const handleUploadFile = async (): Promise<void> => {
//     if (!selectedFile || !prescriptionName) {
//       Alert.alert("Error", "Please fill all required fields.");
//       return;
//     }

//     setUploading(true);

//     try {
//       const formData = new FormData();

//       if (Platform.OS === "web") {
//         const response = await fetch(selectedFile.uri);
//         const blob = await response.blob();
//         formData.append("file", blob, selectedFile.name);
//       } else {
//         formData.append("file", {
//           uri: selectedFile.uri,
//           type: selectedFile.mimeType ?? "application/octet-stream",
//           name: selectedFile.name ?? "prescription.jpg",
//         } as any);
//       }

//       // ✅ Only send required fields (user comes from JWT)
//       formData.append("prescription_name", prescriptionName);

//       // Optional: only send if date is provided
//       if (suggestedDate) {
//         formData.append("document_date", suggestedDate);
//         formData.append("date_source", dateSource);
//       }

//       const response = await apiFetch("/patient/upload/prescription", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert("Success", "Prescription uploaded!");
//         resetState();
//       } else {
//         Alert.alert("Error", data.message || "Upload failed.");
//       }
//     } catch (err: any) {
//       Alert.alert("Error", err.message || "Upload failed.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const resetState = (): void => {
//     setSelectedFile(null);
//     setShowForm(false);
//     setPrescriptionName("");
//     setSuggestedDate("");
//     setDateReason("");
//     setDateSource("ocr");
//   };

//   /* ------------------ Derived ------------------ */

//   const canSubmit = prescriptionName.trim().length > 0;

//   /* ------------------ Render ------------------ */

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Image
//         source={require("../assets/medical-bg.jpg")}
//         style={styles.backgroundImage}
//         resizeMode="cover"
//       />
//       <Text style={styles.title}>Upload Prescription</Text>

//       {!selectedFile && (
//         <TouchableOpacity
//           style={styles.chooseButton}
//           onPress={handleChooseFile}
//         >
//           <Text style={styles.buttonText}>Choose File</Text>
//         </TouchableOpacity>
//       )}

//       {selectedFile && (
//         <View style={styles.previewContainer}>
//           <Text style={styles.fileName}>{selectedFile.name}</Text>

//           {selectedFile.mimeType?.startsWith("image/") && (
//             <Image
//               source={{ uri: selectedFile.uri }}
//               style={styles.imagePreview}
//             />
//           )}

//           <TouchableOpacity style={styles.removeButton} onPress={resetState}>
//             <Text style={styles.removeButtonText}>Remove</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {ocrLoading && (
//         <ActivityIndicator
//           size="large"
//           color="#007bff"
//           style={{ marginVertical: 15 }}
//         />
//       )}

//       {showForm && (
//         <View style={{ width: "100%", marginTop: 15 }}>
//           <Text style={styles.label}>Prescription Name *</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="e.g. OPD Visit - Gynecology"
//             value={prescriptionName}
//             onChangeText={setPrescriptionName}
//           />

//           <Text style={styles.label}>Date of Prescription (Optional)</Text>
//           <TextInput
//             style={styles.input}
//             value={suggestedDate}
//             placeholder="YYYY-MM-DD"
//             onChangeText={(val) => {
//               setSuggestedDate(val);
//               setDateSource("manual");
//             }}
//           />

//           {suggestedDate && (
//             <Text style={styles.helperText}>
//               {dateSource === "ocr"
//                 ? `Detected from document: ${
//                     dateReason || "Reason unavailable"
//                   }`
//                 : "Date edited manually"}
//             </Text>
//           )}
//         </View>
//       )}

//       {selectedFile && showForm && (
//         <TouchableOpacity
//           style={[
//             styles.uploadButton,
//             (!canSubmit || uploading) && styles.uploadButtonDisabled,
//           ]}
//           disabled={!canSubmit || uploading}
//           onPress={handleUploadFile}
//         >
//           {uploading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.uploadText}>Upload Prescription</Text>
//           )}
//         </TouchableOpacity>
//       )}
//     </ScrollView>
//   );
// };

// export default UploadPrescription;

// /* ------------------ Styles ------------------ */

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     alignItems: "center",
//     backgroundColor: "#f9f9f9",
//     padding: 20,
//   },
//   backgroundImage: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     width: "100%",
//     height: "100%",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 20,
//   },
//   chooseButton: {
//     backgroundColor: "#007bff",
//     paddingVertical: 14,
//     paddingHorizontal: 25,
//     borderRadius: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   previewContainer: {
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   fileName: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   imagePreview: {
//     width: 280,
//     height: 280,
//     borderRadius: 10,
//     marginBottom: 10,
//     resizeMode: "contain",
//   },
//   removeButton: {
//     backgroundColor: "#ff4444",
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   removeButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   label: {
//     fontWeight: "600",
//     marginBottom: 6,
//   },
//   helperText: {
//     fontSize: 12,
//     color: "#666",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 10,
//     backgroundColor: "#fff",
//   },
//   uploadButton: {
//     backgroundColor: "#28a745",
//     paddingVertical: 14,
//     paddingHorizontal: 25,
//     borderRadius: 10,
//     marginTop: 20,
//   },
//   uploadButtonDisabled: {
//     backgroundColor: "#999",
//   },
//   uploadText: {
//     color: "#fff",
//     fontSize: 17,
//     fontWeight: "700",
//   },
// });


import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
  ScrollView,
  TextInput,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { apiFetch } from "@/utils/apiFetch";

/* ------------------ Config ------------------ */

const SERVER_URL = "https://qurevault-ver1.onrender.com";
// const SERVER_URL = "http://192.168.0.202:8080";

/* ------------------ Types ------------------ */

type DateSource = "ocr" | "manual";

type PickedFile = DocumentPicker.DocumentPickerAsset | null;

// interface OcrPreviewResponse {
//   dateSuggestion?: {
//     dates?: string[];
//     reason?: string;
//   };
// }
interface OcrPreviewResponse {
  status: "suggested" | "manual_required";
  dates: string[];
  reason?: string;
}


/* ------------------ Component ------------------ */

const UploadPrescription: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PickedFile>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);

  const [prescriptionName, setPrescriptionName] = useState<string>("");
  const [suggestedDate, setSuggestedDate] = useState<string>("");
  const [dateSource, setDateSource] = useState<DateSource>("ocr");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [dateReason, setDateReason] = useState<string>("");

  // ✅ Error handling
  const [errors, setErrors] = useState<{
    prescriptionName?: string;
    file?: string;
  }>({});

  // ✅ Success message
  const [successMessage, setSuccessMessage] = useState("");

  /* ------------------ Handlers ------------------ */

  const handleChooseFile = async (): Promise<void> => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });

      if (!res.canceled && res.assets?.length) {
        const file = res.assets[0];
        setSelectedFile(file);
        setErrors((prev) => ({ ...prev, file: undefined }));
        await runOcrPreview(file);
      }
    } catch {
      Alert.alert("Error", "Could not open file picker.");
    }
  };

  // const runOcrPreview = async (
  //   file: DocumentPicker.DocumentPickerAsset
  // ): Promise<void> => {
  //   try {
  //     setOcrLoading(true);

  //     const formData = new FormData();

  //     if (Platform.OS === "web") {
  //       const response = await fetch(file.uri);
  //       const blob = await response.blob();
  //       formData.append("file", blob, file.name);
  //     } else {
  //       formData.append("file", {
  //         uri: file.uri,
  //         type: file.mimeType ?? "application/octet-stream",
  //         name: file.name ?? "prescription.jpg",
  //       } as any);
  //     }

  //     const res = await fetch(`${SERVER_URL}/patient/ocr-preview`, {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const data: OcrPreviewResponse = await res.json();

  //     if (res.ok && data?.dateSuggestion?.dates?.length > 0) {
  //       setSuggestedDate(data.dateSuggestion.dates[0]);
  //       setDateReason(data.dateSuggestion.reason || "");
  //       setDateSource("ocr");
  //       setShowForm(true);
  //     } else {
  //       setShowForm(true);
  //       Alert.alert(
  //         "OCR",
  //         "Date could not be detected. Please enter manually."
  //       );
  //     }
  //   } catch (err) {
  //     console.error("OCR error:", err);
  //     Alert.alert("OCR Error", "Failed to extract date.");
  //     setShowForm(true);
  //   } finally {
  //     setOcrLoading(false);
  //   }
  // };
  const runOcrPreview = async (
    file: DocumentPicker.DocumentPickerAsset
  ): Promise<void> => {
    try {
      setOcrLoading(true);

      const formData = new FormData();

      if (Platform.OS === "web") {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append("file", blob, file.name);
      } else {
        formData.append("file", {
          uri: file.uri,
          type: file.mimeType ?? "application/octet-stream",
          name: file.name ?? "prescription.jpg",
        } as any);
      }

      const res = await fetch(`${SERVER_URL}/patient/ocr-preview`, {
        method: "POST",
        body: formData,
      });

      const data: OcrPreviewResponse = await res.json();

      // ✅ Fixed: Proper null/undefined checks
      // if (
      //   res.ok &&
      //   data?.dateSuggestion?.dates &&
      //   Array.isArray(data.dateSuggestion.dates) &&
      //   data.dateSuggestion.dates.length > 0
      // ) {
      //   setSuggestedDate(data.dateSuggestion.dates[0]);
      //   setDateReason(data.dateSuggestion.reason || "");
      //   setDateSource("ocr");
      //   setShowForm(true);
      // }
      if (res.ok && data.status === "suggested" && data.dates.length > 0) {
        setSuggestedDate(data.dates[0]);
        setDateReason(data.reason || "");
        setDateSource("ocr");
        setShowForm(true);
      } else if (res.ok && data.status === "manual_required") {
        setSuggestedDate("");
        setDateReason(data.reason || "Please enter the date manually.");
        setDateSource("manual");
        setShowForm(true);
      }
      else {
        setShowForm(true);
        Alert.alert(
          "OCR",
          "Date could not be detected. Please enter manually."
        );
      }
    } catch (err) {
      console.error("OCR error:", err);
      Alert.alert("OCR Error", "Failed to extract date.");
      setShowForm(true);
    } finally {
      setOcrLoading(false);
    }
  };

  /* ------------------ Validation ------------------ */

  // const validateForm = () => {
  //   const newErrors: typeof errors = {};

  //   if (!selectedFile) {
  //     newErrors.file = "This field is required";
  //   }

  //   // if (!prescriptionName.trim()) {
  //   //   newErrors.prescriptionName = "This field is required";
  //   // }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  /* ------------------ Upload ------------------ */

  const handleUploadFile = async (): Promise<void> => {
    
    // if (!validateForm()) return;

    setUploading(true);

    try {
      const formData = new FormData();

      if (Platform.OS === "web") {
        const response = await fetch(selectedFile!.uri);
        const blob = await response.blob();
        formData.append("file", blob, selectedFile!.name);
      } else {
        formData.append("file", {
          uri: selectedFile!.uri,
          type: selectedFile!.mimeType ?? "application/octet-stream",
          name: selectedFile!.name ?? "prescription.jpg",
        } as any);
      }

      formData.append("prescription_name", prescriptionName);

      if (suggestedDate) {
        formData.append("document_date", suggestedDate);
        formData.append("date_source", dateSource);
      }

      const response = await apiFetch("/patient/upload/prescription", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Upload failed.");
        return;
      }

      setSuccessMessage("Prescription uploaded successfully");
      resetState();
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err: any) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const resetState = (): void => {
    setSelectedFile(null);
    setShowForm(false);
    setPrescriptionName("");
    setSuggestedDate("");
    setDateReason("");
    setDateSource("ocr");
    setErrors({});
  };

  /* ------------------ Render ------------------ */

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require("../assets/medical-bg.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* ✅ Success Message Box */}
      {successMessage !== "" && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <Text style={styles.title}>Upload Prescription</Text>

      {!selectedFile && (
        <>
          <TouchableOpacity
            style={styles.chooseButton}
            onPress={handleChooseFile}
          >
            <Text style={styles.buttonText}>Choose File</Text>
          </TouchableOpacity>
          {errors.file && (
            <Text style={styles.errorText}>{errors.file}</Text>
          )}
        </>
      )}

      {ocrLoading && (
        <ActivityIndicator size="large" color="#007bff" />
      )}

      {selectedFile && (
        <View style={styles.previewContainer}>
          <Text style={styles.fileName}>{selectedFile.name}</Text>

          {selectedFile.mimeType?.startsWith("image/") && (
            <Image
              source={{ uri: selectedFile.uri }}
              style={styles.imagePreview}
            />
          )}

          <TouchableOpacity style={styles.removeButton} onPress={resetState}>
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}

      {showForm && (
        <View style={{ width: "100%", marginTop: 15 }}>
          <Text style={styles.label}>Prescription Name</Text>
          <TextInput
            style={[
              styles.input,
              errors.prescriptionName && styles.inputError,
            ]}
            placeholder="e.g. OPD Visit - Gynecology"
            value={prescriptionName}
            onChangeText={(v) => {
              setPrescriptionName(v);
              setErrors((e) => ({
                ...e,
                prescriptionName: undefined,
              }));
            }}
          />
          {errors.prescriptionName && (
            <Text style={styles.errorText}>
              {errors.prescriptionName}
            </Text>
          )}


          <Text style={styles.label}>Date of Prescription *</Text>
          <TextInput
            style={styles.input}
            value={suggestedDate}
            placeholder="YYYY-MM-DD"
            onChangeText={(val) => {
              setSuggestedDate(val);
              setDateSource("manual");
            }}
          />

          {/* {suggestedDate !== "" && (
            <Text
              style={{
                fontSize: 12,
                color: "#666",
                marginBottom: 8,
              }}
            >
              {dateSource === "ocr"
                ? `Detected from document${dateReason ? `: ${dateReason}` : ""
                }`
                : "Date entered manually"}
            </Text>
          )}
          {dateSource === "manual" && (
            <View
              style={{
                backgroundColor: "#fff3cd",
                borderColor: "#ffeeba",
                borderWidth: 1,
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "#856404", fontSize: 13 }}>
                {dateReason ||
                  "We couldn’t reliably detect the date. Please enter it manually."}
              </Text>
            </View>
          )} */}
          {showForm && (
            <>
              {/* OCR / Manual info text */}
              {(suggestedDate !== "" || dateSource === "manual") && (
                <Text
                  style={{
                    fontSize: 12,
                    color: "#666",
                    marginBottom: 8,
                  }}
                >
                  {dateSource === "ocr"
                    ? `Detected from document${dateReason ? `: ${dateReason}` : ""}`
                    : "Date entered manually"}
                </Text>
              )}

              {/* Manual required warning */}
              {dateSource === "manual" && (
                <View
                  style={{
                    backgroundColor: "#fff3cd",
                    borderColor: "#ffeeba",
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 8,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: "#856404", fontSize: 13 }}>
                    {dateReason ||
                      "We couldn’t reliably detect the date. Please enter it manually."}
                  </Text>
                </View>
              )}
            </>
          )}

        </View>
      )}

      {selectedFile && showForm && (
        // <TouchableOpacity
        //   style={[
        //     styles.uploadButton,
        //     uploading && styles.uploadButtonDisabled,
        //   ]}
        //   disabled={uploading}
        //   onPress={handleUploadFile}
        // >
        // <TouchableOpacity
        //   style={[
        //     styles.uploadButton,
        //     (uploading || !prescriptionName.trim()) &&
        //     styles.uploadButtonDisabled,
        //   ]}
        //   disabled={uploading || !prescriptionName.trim()}
        //   onPress={handleUploadFile}
        // >
        <TouchableOpacity
  style={[
    styles.uploadButton,
    uploading && styles.uploadButtonDisabled,
  ]}
  disabled={uploading}
  onPress={handleUploadFile}
>

          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadText}>Upload Prescription</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default UploadPrescription;

/* ------------------ Styles ------------------ */

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
    justifyContent: "center",
  },
   overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // ✅ Semi-transparent overlay
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 20,
  },
  chooseButton: {
    backgroundColor: "#007bff",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  fileName: {
    fontSize: 16,
    marginBottom: 10,
  },
  imagePreview: {
    width: 280,
    height: 280,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: "contain",
  },
  removeButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ff4444",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 20,
  },
  uploadButtonDisabled: {
    backgroundColor: "#999",
  },
  uploadText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  // ✅ Success message styles
  successBox: {
    width: "100%",
    backgroundColor: "#d4edda",
    borderColor: "#28a745",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  successText: {
    color: "#155724",
    fontWeight: "600",
    textAlign: "center",
  },
});




// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Platform,
//   Alert,
//   ScrollView,
//   TextInput,
// } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import { useLocalSearchParams } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { apiFetch } from "@/utils/apiFetch";

// /* ------------------ Config ------------------ */

// const SERVER_URL = "http://192.168.0.202:8080";

// /* ------------------ Types ------------------ */

// type DateSource = "ocr" | "manual";

// type PickedFile = DocumentPicker.DocumentPickerAsset | null;

// interface OcrPreviewResponse {
//   dateSuggestion?: {
//     dates?: string[];
//     reason?: string;
//   };
// }

// /* ------------------ Component ------------------ */

// const UploadPrescription: React.FC = () => {
//   const params = useLocalSearchParams<{ userId?: string }>();

//   const [selectedFile, setSelectedFile] = useState<PickedFile>(null);
//   const [uploading, setUploading] = useState<boolean>(false);
//   const [ocrLoading, setOcrLoading] = useState<boolean>(false);

//   const [userId, setUserId] = useState<string | null>(null);

//   const [suggestedDate, setSuggestedDate] = useState<string>("");
//   const [prescriptionName, setPrescriptionName] = useState<string>("");
//   const [dateSource, setDateSource] = useState<DateSource>("ocr");
//   const [showForm, setShowForm] = useState<boolean>(false);
//   const [dateReason, setDateReason] = useState<string>("");

//   /* ------------------ Effects ------------------ */

//   useEffect(() => {
//     const fetchUserId = async (): Promise<void> => {
//       let id = params.userId ?? (await AsyncStorage.getItem("user_id"));
//       setUserId(id);
//     };

//     fetchUserId();
//   }, [params]);

//   /* ------------------ Handlers ------------------ */

//   const handleChooseFile = async (): Promise<void> => {
//     try {
//       const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });

//       if (!res.canceled && res.assets?.length) {
//         const file = res.assets[0];
//         setSelectedFile(file);
//         await runOcrPreview(file);
//       }
//     } catch {
//       Alert.alert("Error", "Could not open file picker.");
//     }
//   };

//   const runOcrPreview = async (
//     file: DocumentPicker.DocumentPickerAsset
//   ): Promise<void> => {
//     try {
//       setOcrLoading(true);

//       const formData = new FormData();

//       if (Platform.OS === "web") {
//         const response = await fetch(file.uri);
//         const blob = await response.blob();
//         formData.append("file", blob, file.name);
//       } else {
//         formData.append("file", {
//           uri: file.uri,
//           type: file.mimeType ?? "application/octet-stream",
//           name: file.name ?? "prescription.jpg",
//         } as any);
//       }

//       const res = await fetch(`${SERVER_URL}/patient/ocr-preview`, {
//         method: "POST",
//         body: formData,
//       });

//       const data: OcrPreviewResponse = await res.json();

//       if (res.ok) {
//         setSuggestedDate(data.dateSuggestion?.dates?.[0] ?? "");
//         setDateReason(data.dateSuggestion?.reason ?? "");
//         setShowForm(true);
//       } else {
//         Alert.alert("OCR Error", "Could not extract date");
//       }
//     } catch {
//       Alert.alert("Error", "OCR failed");
//     } finally {
//       setOcrLoading(false);
//     }
//   };

//   // const handleUploadFile = async (): Promise<void> => {
//   //   if (!selectedFile || !prescriptionName || !suggestedDate) {
//   //     Alert.alert("Error", "Please fill all required fields.");
//   //     return;
//   //   }

//   //   if (!userId) {
//   //     Alert.alert("Error", "User ID not found.");
//   //     return;
//   //   }

//   //   setUploading(true);

//   //   try {
//   //     const formData = new FormData();

//   //     if (Platform.OS === "web") {
//   //       const response = await fetch(selectedFile.uri);
//   //       const blob = await response.blob();
//   //       formData.append("file", blob, selectedFile.name);
//   //     } else {
//   //       formData.append("file", {
//   //         uri: selectedFile.uri,
//   //         type: selectedFile.mimeType ?? "application/octet-stream",
//   //         name: selectedFile.name ?? "prescription.jpg",
//   //       } as any);
//   //     }

//   //     formData.append("user_id", String(userId));
//   //     formData.append("prescription_name", prescriptionName);
//   //     formData.append("document_date", suggestedDate);
//   //     formData.append("date_source", dateSource);

//   //     const response = await fetch(
//   //       `${SERVER_URL}/patient/upload/prescription`,
//   //       { method: "POST", body: formData }
//   //     );

//   //     const data = await response.json();

//   //     if (response.ok) {
//   //       Alert.alert("Success", "Prescription uploaded!");
//   //       resetState();
//   //     } else {
//   //       Alert.alert("Error", data.message || "Upload failed.");
//   //     }
//   //   } catch {
//   //     Alert.alert("Error", "Upload failed.");
//   //   } finally {
//   //     setUploading(false);
//   //   }
//   // };
//   const handleUploadFile = async (): Promise<void> => {
//     if (!selectedFile || !prescriptionName || !suggestedDate) {
//       Alert.alert("Error", "Please fill all required fields.");
//       return;
//     }

//     if (!userId) {
//       Alert.alert("Error", "User ID not found.");
//       return;
//     }

//     setUploading(true);

//     try {
//       const formData = new FormData();

//       if (Platform.OS === "web") {
//         const response = await fetch(selectedFile.uri);
//         const blob = await response.blob();
//         formData.append("file", blob, selectedFile.name);
//       } else {
//         formData.append("file", {
//           uri: selectedFile.uri,
//           type: selectedFile.mimeType ?? "application/octet-stream",
//           name: selectedFile.name ?? "prescription.jpg",
//         } as any);
//       }

//       // ❌ DO NOT send user_id (backend takes from JWT)
//       formData.append("prescription_name", prescriptionName);
//       formData.append("document_date", suggestedDate);
//       formData.append("date_source", dateSource);

//       const response = await apiFetch("/patient/upload/prescription", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();

//       if (response.ok) {
//         Alert.alert("Success", "Prescription uploaded!");
//         resetState();
//       } else {
//         Alert.alert("Error", data.message || "Upload failed.");
//       }
//     } catch (err: any) {
//       Alert.alert("Error", err.message || "Upload failed.");
//     } finally {
//       setUploading(false);
//     }
//   };


//   const resetState = (): void => {
//     setSelectedFile(null);
//     setShowForm(false);
//     setPrescriptionName("");
//     setSuggestedDate("");
//     setDateReason("");
//     setDateSource("ocr");
//   };

//   /* ------------------ Derived ------------------ */

//   const canSubmit =
//     prescriptionName.trim().length > 0 &&
//     suggestedDate.trim().length > 0;

//   /* ------------------ Render ------------------ */

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Image
//         source={require("../assets/medical-bg.jpg")}
//         style={styles.backgroundImage}
//         resizeMode="cover"
//       />
//       <Text style={styles.title}>Upload Prescription</Text>

//       {!selectedFile && (
//         <TouchableOpacity
//           style={styles.chooseButton}
//           onPress={handleChooseFile}
//         >
//           <Text style={styles.buttonText}>Choose File</Text>
//         </TouchableOpacity>
//       )}

//       {selectedFile && (
//         <View style={styles.previewContainer}>
//           <Text style={styles.fileName}>{selectedFile.name}</Text>

//           {selectedFile.mimeType?.startsWith("image/") && (
//             <Image
//               source={{ uri: selectedFile.uri }}
//               style={styles.imagePreview}
//             />
//           )}

//           <TouchableOpacity
//             style={styles.removeButton}
//             onPress={resetState}
//           >
//             <Text style={styles.removeButtonText}>Remove</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {ocrLoading && (
//         <ActivityIndicator
//           size="large"
//           color="#007bff"
//           style={{ marginVertical: 15 }}
//         />
//       )}

//       {showForm && (
//         <View style={{ width: "100%", marginTop: 15 }}>
//           <Text style={styles.label}>Prescription Name</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="e.g. OPD Visit - Gynecology"
//             value={prescriptionName}
//             onChangeText={setPrescriptionName}
//           />

//           <Text style={styles.label}>Date of Prescription</Text>
//           <TextInput
//             style={styles.input}
//             value={suggestedDate}
//             placeholder="YYYY-MM-DD"
//             onChangeText={(val) => {
//               setSuggestedDate(val);
//               setDateSource("manual");
//             }}
//           />

//           {suggestedDate && (
//             <Text style={styles.helperText}>
//               {dateSource === "ocr"
//                 ? `Detected from document: ${dateReason || "Reason unavailable"
//                 }`
//                 : "Date edited manually"}
//             </Text>
//           )}
//         </View>
//       )}

//       {selectedFile && showForm && (
//         <TouchableOpacity
//           style={[
//             styles.uploadButton,
//             (!canSubmit || uploading) && styles.uploadButtonDisabled,
//           ]}
//           disabled={!canSubmit || uploading}
//           onPress={handleUploadFile}
//         >
//           {uploading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <Text style={styles.uploadText}>Upload Prescription</Text>
//           )}
//         </TouchableOpacity>
//       )}
//     </ScrollView>
//   );
// };

// export default UploadPrescription;

// /* ------------------ Styles ------------------ */

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     alignItems: "center",
//     backgroundColor: "#f9f9f9",
//     padding: 20,
//   },
//   backgroundImage: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     width: "100%",
//     height: "100%",
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 20,
//   },
//   chooseButton: {
//     backgroundColor: "#007bff",
//     paddingVertical: 14,
//     paddingHorizontal: 25,
//     borderRadius: 10,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   previewContainer: {
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   fileName: {
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   imagePreview: {
//     width: 280,
//     height: 280,
//     borderRadius: 10,
//     marginBottom: 10,
//     resizeMode: "contain",
//   },
//   removeButton: {
//     backgroundColor: "#ff4444",
//     paddingVertical: 8,
//     paddingHorizontal: 20,
//     borderRadius: 8,
//   },
//   removeButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//   },
//   label: {
//     fontWeight: "600",
//     marginBottom: 6,
//   },
//   helperText: {
//     fontSize: 12,
//     color: "#666",
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 10,
//     backgroundColor: "#fff",
//   },
//   uploadButton: {
//     backgroundColor: "#28a745",
//     paddingVertical: 14,
//     paddingHorizontal: 25,
//     borderRadius: 10,
//     marginTop: 20,
//   },
//   uploadButtonDisabled: {
//     backgroundColor: "#999",
//   },
//   uploadText: {
//     color: "#fff",
//     fontSize: 17,
//     fontWeight: "700",
//   },
// });
