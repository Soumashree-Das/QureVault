// v3-> jwt+ocr+mandatory ui fixes
// v2 -> working with ocr+ jwt auth
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

/* ============================
   Types
   ============================ */

type ReportType =
    | "USG"
    | "ECG"
    | "ECHO"
    | "BLOOD_TEST"
    | "URINE_TEST"
    | "XRAY"
    | "MRI"
    | "CT"
    | "VITALS"
    | "DISCHARGE_SUMMARY"
    | "OTHER";

const REPORT_TYPES: { label: string; value: ReportType }[] = [
    { label: "Ultrasound (USG)", value: "USG" },
    { label: "ECG", value: "ECG" },
    { label: "ECHO", value: "ECHO" },
    { label: "Blood Test", value: "BLOOD_TEST" },
    { label: "Urine Test", value: "URINE_TEST" },
    { label: "X-Ray", value: "XRAY" },
    { label: "MRI", value: "MRI" },
    { label: "CT Scan", value: "CT" },
    { label: "Vitals", value: "VITALS" },
    { label: "Discharge Summary", value: "DISCHARGE_SUMMARY" },
    { label: "Other", value: "OTHER" },
];

/* ============================
   Component
   ============================ */

const UploadReport: React.FC = () => {
    const [selectedFile, setSelectedFile] =
        useState<DocumentPicker.DocumentPickerAsset | null>(null);

    const [uploading, setUploading] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrReason, setOcrReason] = useState("");

    const [reportName, setReportName] = useState("");
    const [reportType, setReportType] = useState<ReportType | "">("");
    const [documentDate, setDocumentDate] = useState("");
    const [dateSource, setDateSource] = useState<"ocr" | "manual">("manual");

    const [showForm, setShowForm] = useState(false);

    const [errors, setErrors] = useState<{
        reportName?: string;
        documentDate?: string;
        file?: string;
    }>({});

    const [successMessage, setSuccessMessage] = useState("");


    const runOcrPreview = async (
        file: DocumentPicker.DocumentPickerAsset
    ) => {
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
                    name: file.name ?? "report.jpg",
                } as any);
            }

            const res = await apiFetch("/patient/ocr-preview", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok && data?.dateSuggestion?.dates?.length > 0) {
                setDocumentDate(data.dateSuggestion.dates[0]);
                setOcrReason(data.dateSuggestion.reason || "");
                setDateSource("ocr");
                setShowForm(true);
            } else {
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

    /* ============================
       File Picker
       ============================ */

    const handleChooseFile = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });

            if (!res.canceled && res.assets.length > 0) {
                const file = res.assets[0];
                setSelectedFile(file);
                setErrors((prev) => ({ ...prev, file: undefined }));
                runOcrPreview(file);
            }
        } catch {
            Alert.alert("Error", "Could not open file picker.");
        }
    };

    /* ============================
       Upload
       ============================ */

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!selectedFile) {
            newErrors.file = "This field is required";
        }

        if (!reportName.trim()) {
            newErrors.reportName = "This field is required";
        }

        if (!documentDate.trim()) {
            newErrors.documentDate = "This field is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleUpload = async () => {
        if (!validateForm()) return;

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
                    name: selectedFile!.name ?? "report.jpg",
                } as any);
            }

            formData.append("report_name", reportName);
            formData.append("document_date", documentDate);
            formData.append("date_source", dateSource);

            if (reportType) {
                formData.append("report_type", reportType);
            }

            const res = await apiFetch("/patient/upload/report", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                Alert.alert("Error", data.message || "Upload failed.");
                return;
            }
            setSuccessMessage("Report uploaded successfully");

            // Alert.alert("Success", "Report uploaded successfully");
            resetState();
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (err) {
            console.error("Upload error:", err);
            Alert.alert("Error", "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const resetState = () => {
        setSelectedFile(null);
        setShowForm(false);
        setReportName("");
        setReportType("");
        setDocumentDate("");
        setDateSource("manual");
        setErrors({});
    };

    /* ============================
       UI
       ============================ */

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image
                source={require("../assets/medical-bg.jpg")}
                style={styles.backgroundImage}
                resizeMode="cover"
            />
            {successMessage !== "" && (
                <View style={styles.successBox}>
                    <Text style={styles.successText}>{successMessage}</Text>
                </View>
            )}


            <Text style={styles.title}>Upload Medical Report</Text>

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

                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={resetState}
                    >
                        <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                </View>
            )}

            {showForm && (
                <View style={{ width: "100%", marginTop: 15 }}>
                    <Text style={styles.label}>Report Name</Text>
                    <TextInput
                        style={[
                            styles.input,
                            errors.reportName && styles.inputError,
                        ]}
                        value={reportName}
                        onChangeText={(v) => {
                            setReportName(v);
                            setErrors((e) => ({
                                ...e,
                                reportName: undefined,
                            }));
                        }}
                    />
                    {errors.reportName && (
                        <Text style={styles.errorText}>
                            {errors.reportName}
                        </Text>
                    )}

                    <Text style={styles.label}>Date of Report</Text>
                    <TextInput
                        style={[
                            styles.input,
                            errors.documentDate && styles.inputError,
                        ]}
                        value={documentDate}
                        onChangeText={(v) => {
                            setDocumentDate(v);
                            setDateSource("manual");
                            setErrors((e) => ({
                                ...e,
                                documentDate: undefined,
                            }));
                        }}
                        placeholder="YYYY-MM-DD"
                    />
                    {errors.documentDate && (
                        <Text style={styles.errorText}>
                            {errors.documentDate}
                        </Text>
                    )}

                    {documentDate !== "" && (
                        <Text
                            style={{
                                fontSize: 12,
                                color: "#666",
                                marginBottom: 8,
                            }}
                        >
                            {dateSource === "ocr"
                                ? `Detected from document${ocrReason ? `: ${ocrReason}` : ""
                                }`
                                : "Date entered manually"}
                        </Text>
                    )}

                    <Text style={styles.label}>Report Type (optional)</Text>

                    {REPORT_TYPES.map((t) => (
                        <TouchableOpacity
                            key={t.value}
                            style={[
                                styles.typeOption,
                                reportType === t.value &&
                                styles.typeOptionSelected,
                            ]}
                            onPress={() => setReportType(t.value)}
                        >
                            <Text>{t.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {selectedFile && showForm && (
                <TouchableOpacity
                    style={[
                        styles.uploadButton,
                        uploading && styles.uploadButtonDisabled,
                    ]}
                    disabled={uploading}
                    onPress={handleUpload}
                >
                    {uploading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.uploadText}>Upload Report</Text>
                    )}
                </TouchableOpacity>

            )}
        </ScrollView>
    );
};

export default UploadReport;

/* ============================
   Styles
   ============================ */

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        padding: 20,
    },
    backgroundImage: {
        position: "absolute",
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
    typeOption: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        marginBottom: 6,
    },
    typeOptionSelected: {
        backgroundColor: "#d0ebff",
        borderColor: "#007bff",
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



// v2 -> working with ocr+ jwt auth
// import React, { useState } from "react";
// import {
//     View,
//     Text,
//     Image,
//     TouchableOpacity,
//     StyleSheet,
//     ActivityIndicator,
//     Platform,
//     Alert,
//     ScrollView,
//     TextInput,
// } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import { apiFetch } from "@/utils/apiFetch";

// /* ============================
//    Types
//    ============================ */

// type ReportType =
//     | "USG"
//     | "ECG"
//     | "ECHO"
//     | "BLOOD_TEST"
//     | "URINE_TEST"
//     | "XRAY"
//     | "MRI"
//     | "CT"
//     | "VITALS"
//     | "DISCHARGE_SUMMARY"
//     | "OTHER";

// const REPORT_TYPES: { label: string; value: ReportType }[] = [
//     { label: "Ultrasound (USG)", value: "USG" },
//     { label: "ECG", value: "ECG" },
//     { label: "ECHO", value: "ECHO" },
//     { label: "Blood Test", value: "BLOOD_TEST" },
//     { label: "Urine Test", value: "URINE_TEST" },
//     { label: "X-Ray", value: "XRAY" },
//     { label: "MRI", value: "MRI" },
//     { label: "CT Scan", value: "CT" },
//     { label: "Vitals", value: "VITALS" },
//     { label: "Discharge Summary", value: "DISCHARGE_SUMMARY" },
//     { label: "Other", value: "OTHER" },
// ];

// /* ============================
//    Component
//    ============================ */
// const BACKEND_URL = "http://192.168.0.202:8080";

// const UploadReport: React.FC = () => {
//     const [selectedFile, setSelectedFile] =
//         useState<DocumentPicker.DocumentPickerAsset | null>(null);

//     const [uploading, setUploading] = useState(false);
//     //   const [ocrLoading, setOcrLoading] = useState(false);
//     const [ocrLoading, setOcrLoading] = useState(false);
//     const [ocrReason, setOcrReason] = useState("");

//     const [reportName, setReportName] = useState("");
//     const [reportType, setReportType] = useState<ReportType | "">("");
//     const [documentDate, setDocumentDate] = useState("");
//     const [dateSource, setDateSource] = useState<"ocr" | "manual">("manual");

//     const [showForm, setShowForm] = useState(false);

//     const [errors, setErrors] = useState<{
//         reportName?: string;
//         documentDate?: string;
//         file?: string;
//     }>({});



//     const runOcrPreview = async (
//         file: DocumentPicker.DocumentPickerAsset
//     ) => {
//         try {
//             setOcrLoading(true);

//             const formData = new FormData();

//             if (Platform.OS === "web") {
//                 const response = await fetch(file.uri);
//                 const blob = await response.blob();
//                 formData.append("file", blob, file.name);
//             } else {
//                 formData.append("file", {
//                     uri: file.uri,
//                     type: file.mimeType ?? "application/octet-stream",
//                     name: file.name ?? "report.jpg",
//                 } as any);
//             }

//             const res = await apiFetch("/patient/ocr-preview", {
//                 method: "POST",
//                 body: formData,
//             });

//             const data = await res.json();

//             if (res.ok && data?.dateSuggestion?.dates?.length > 0) {
//                 setDocumentDate(data.dateSuggestion.dates[0]);
//                 setOcrReason(data.dateSuggestion.reason || "");
//                 setDateSource("ocr");
//                 setShowForm(true);
//             } else {
//                 setShowForm(true);
//                 Alert.alert("OCR", "Date could not be detected. Please enter manually.");
//             }
//         } catch (err) {
//             console.error("OCR error:", err);
//             Alert.alert("OCR Error", "Failed to extract date.");
//             setShowForm(true);
//         } finally {
//             setOcrLoading(false);
//         }
//     };
//     console.log("OCR PREVIEW STARTED");

//     /* ============================
//        File Picker
//        ============================ */

//     // const handleChooseFile = async () => {
//     //     try {
//     //         const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });

//     //         if (!res.canceled && res.assets.length > 0) {
//     //             setSelectedFile(res.assets[0]);
//     //             setShowForm(true);
//     //         }
//     //     } catch {
//     //         Alert.alert("Error", "Could not open file picker.");
//     //     }
//     // };
//     const handleChooseFile = async () => {
//         try {
//             const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });

//             if (!res.canceled && res.assets.length > 0) {
//                 const file = res.assets[0];
//                 setSelectedFile(file);
//                 runOcrPreview(file); // 🔥 OCR happens here
//                 console.log("Sending file to OCR:", {
//                     uri: file.uri,
//                     name: file.name,
//                     type: file.mimeType,
//                 });

//             }
//         } catch {
//             Alert.alert("Error", "Could not open file picker.");
//         }
//     };


//     /* ============================
//        Upload
//        ============================ */
//     const validateForm = () => {
//         const newErrors: typeof errors = {};

//         if (!selectedFile) {
//             newErrors.file = "Please select a report file";
//         }

//         if (!reportName.trim()) {
//             newErrors.reportName = "Report name is required";
//         }

//         if (!documentDate.trim()) {
//             newErrors.documentDate = "Date of report is required";
//         }

//         setErrors(newErrors);

//         return Object.keys(newErrors).length === 0;
//     };

//     const handleUpload = async () => {
//         if (!validateForm()) {
//             return;
//         }

//         setUploading(true);

//         try {
//             const formData = new FormData();

//             if (Platform.OS === "web") {
//                 const response = await fetch(selectedFile!.uri);
//                 const blob = await response.blob();
//                 formData.append("file", blob, selectedFile!.name);
//             } else {
//                 formData.append("file", {
//                     uri: selectedFile!.uri,
//                     type: selectedFile!.mimeType ?? "application/octet-stream",
//                     name: selectedFile!.name ?? "report.jpg",
//                 } as any);
//             }

//             formData.append("report_name", reportName);
//             formData.append("document_date", documentDate);
//             formData.append("date_source", dateSource);

//             if (reportType) {
//                 formData.append("report_type", reportType);
//             }

//             const res = await apiFetch("/patient/upload/report", {
//                 method: "POST",
//                 body: formData,
//             });

//             const data = await res.json();

//             if (!res.ok) {
//                 Alert.alert("Error", data.message || "Upload failed.");
//                 return;
//             }

//             Alert.alert("Success", "Report uploaded successfully");
//             resetState();

//         } catch (err) {
//             console.error("Upload error:", err);
//             Alert.alert("Error", "Upload failed.");
//         } finally {
//             setUploading(false);
//         }
//     };


//     // const handleUpload = async () => {
//     //     // if (!selectedFile || !reportName || !documentDate) {
//     //     //     Alert.alert("Error", "Please fill all required fields.");
//     //     //     return;
//     //     // }
//     //     if (!validateForm()) {
//     //         return;
//     //     }


//     //     setUploading(true);

//     //     try {
//     //         const formData = new FormData();

//     //         if (Platform.OS === "web") {
//     //             const response = await fetch(selectedFile.uri);
//     //             const blob = await response.blob();
//     //             formData.append("file", blob, selectedFile.name);
//     //         } else {
//     //             formData.append("file", {
//     //                 uri: selectedFile.uri,
//     //                 type: selectedFile.mimeType ?? "application/octet-stream",
//     //                 name: selectedFile.name ?? "report.jpg",
//     //             } as any);
//     //         }

//     //         formData.append("report_name", reportName);
//     //         formData.append("document_date", documentDate);
//     //         formData.append("date_source", dateSource);

//     //         if (reportType) {
//     //             formData.append("report_type", reportType);
//     //         }


//     //         const res = await apiFetch("/patient/upload/report", {
//     //             method: "POST",
//     //             body: formData,
//     //             headers: {
//     //                 // DO NOT set Content-Type manually for FormData
//     //             },
//     //         });

//     //         const data = await res.json();

//     //         if (!res.ok) {
//     //             Alert.alert("Error", data.message || "Upload failed.");
//     //             return;
//     //         }
//     //         console.log("OCR RESPONSE STATUS:", res.status);
//     //         console.log("OCR RESPONSE DATA:", data);

//     //         Alert.alert("Success", "Report uploaded successfully");
//     //         resetState();

//     //     } catch (err) {
//     //         console.error("Upload error:", err);
//     //         Alert.alert("Error", "Upload failed.");
//     //     } finally {
//     //         setUploading(false);
//     //     }
//     // };

//     const resetState = () => {
//         setSelectedFile(null);
//         setShowForm(false);
//         setReportName("");
//         setReportType("");
//         setDocumentDate("");
//         setDateSource("manual");
//     };

//     /* ============================
//        UI
//        ============================ */

//     return (
//         <ScrollView contentContainerStyle={styles.container}>
//             <Image
//                 source={require("../assets/medical-bg.jpg")}
//                 style={styles.backgroundImage}
//                 resizeMode="cover"
//             />

//             <Text style={styles.title}>Upload Medical Report</Text>

//             {!selectedFile && (
//                 <TouchableOpacity style={styles.chooseButton} onPress={handleChooseFile}>
//                     <Text style={styles.buttonText}>Choose File</Text>
//                 </TouchableOpacity>
//             )}

//             {ocrLoading && (
//                 <ActivityIndicator size="large" color="#007bff" />
//             )}

//             {selectedFile && (
//                 <View style={styles.previewContainer}>
//                     <Text style={styles.fileName}>{selectedFile.name}</Text>

//                     {selectedFile.mimeType?.startsWith("image/") && (
//                         <Image
//                             source={{ uri: selectedFile.uri }}
//                             style={styles.imagePreview}
//                         />
//                     )}

//                     <TouchableOpacity style={styles.removeButton} onPress={resetState}>
//                         <Text style={styles.removeButtonText}>Remove</Text>
//                     </TouchableOpacity>
//                 </View>
//             )}

//             {showForm && (
//                 <View style={{ width: "100%", marginTop: 15 }}>
//                     <Text style={styles.label}>Report Name</Text>
//                     <TextInput
//                         style={styles.input}
//                         value={reportName}
//                         onChangeText={setReportName}
//                     />

//                     {/* <Text style={styles.label}>Date of Report</Text>
//                     <TextInput
//                         style={styles.input}
//                         value={documentDate}
//                         onChangeText={(v) => {
//                             setDocumentDate(v);
//                             setDateSource("manual");
//                         }}
//                         placeholder="YYYY-MM-DD"
//                     />
//                      */}
//                     <Text style={styles.label}>Date of Report</Text>
//                     <TextInput
//                         style={styles.input}
//                         value={documentDate}
//                         onChangeText={(v) => {
//                             setDocumentDate(v);
//                             setDateSource("manual");
//                         }}
//                         placeholder="YYYY-MM-DD"
//                     />

//                     {documentDate !== "" && (
//                         <Text style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
//                             {dateSource === "ocr"
//                                 ? `Detected from document${ocrReason ? `: ${ocrReason}` : ""}`
//                                 : "Date entered manually"}
//                         </Text>
//                     )}

//                     <Text style={styles.label}>Report Type (optional)</Text>

//                     {REPORT_TYPES.map((t) => (
//                         <TouchableOpacity
//                             key={t.value}
//                             style={[
//                                 styles.typeOption,
//                                 reportType === t.value && styles.typeOptionSelected,
//                             ]}
//                             onPress={() => setReportType(t.value)}
//                         >
//                             <Text>{t.label}</Text>
//                         </TouchableOpacity>
//                     ))}
//                 </View>
//             )}

//             {selectedFile && showForm && (
//                 <TouchableOpacity
//                     style={[
//                         styles.uploadButton,
//                         uploading && styles.uploadButtonDisabled,
//                     ]}
//                     disabled={uploading}
//                     onPress={handleUpload}
//                 >
//                     {uploading ? (
//                         <ActivityIndicator color="#fff" />
//                     ) : (
//                         <Text style={styles.uploadText}>Upload Report</Text>
//                     )}
//                 </TouchableOpacity>
//             )}
//         </ScrollView>
//     );
// };

// export default UploadReport;

// /* ============================
//    Styles
//    ============================ */

// const styles = StyleSheet.create({
//     container: {
//         flexGrow: 1,
//         alignItems: "center",
//         backgroundColor: "#f9f9f9",
//         padding: 20,
//     },
//     backgroundImage: {
//         position: "absolute",
//         width: "100%",
//         height: "100%",
//     },
//     title: {
//         fontSize: 22,
//         fontWeight: "700",
//         marginBottom: 20,
//     },
//     chooseButton: {
//         backgroundColor: "#007bff",
//         paddingVertical: 14,
//         paddingHorizontal: 25,
//         borderRadius: 10,
//     },
//     buttonText: {
//         color: "#fff",
//         fontWeight: "600",
//         fontSize: 16,
//     },
//     previewContainer: {
//         alignItems: "center",
//         marginBottom: 15,
//     },
//     fileName: {
//         fontSize: 16,
//         marginBottom: 10,
//     },
//     imagePreview: {
//         width: 280,
//         height: 280,
//         borderRadius: 10,
//         marginBottom: 10,
//         resizeMode: "contain",
//     },
//     removeButton: {
//         backgroundColor: "#ff4444",
//         paddingVertical: 8,
//         paddingHorizontal: 20,
//         borderRadius: 8,
//     },
//     removeButtonText: {
//         color: "#fff",
//         fontWeight: "600",
//     },
//     label: {
//         fontWeight: "600",
//         marginBottom: 6,
//     },
//     input: {
//         borderWidth: 1,
//         borderColor: "#ccc",
//         borderRadius: 8,
//         padding: 10,
//         marginBottom: 10,
//         backgroundColor: "#fff",
//     },
//     typeOption: {
//         padding: 10,
//         borderWidth: 1,
//         borderColor: "#ccc",
//         borderRadius: 8,
//         marginBottom: 6,
//     },
//     typeOptionSelected: {
//         backgroundColor: "#d0ebff",
//         borderColor: "#007bff",
//     },
//     uploadButton: {
//         backgroundColor: "#28a745",
//         paddingVertical: 14,
//         paddingHorizontal: 25,
//         borderRadius: 10,
//         marginTop: 20,
//     },
//     uploadButtonDisabled: {
//         backgroundColor: "#999",
//     },
//     uploadText: {
//         color: "#fff",
//         fontSize: 17,
//         fontWeight: "700",
//     },
// });


// v1-> without jwt
// import React, { useState, useEffect } from "react";
// import {
//     View,
//     Text,
//     Image,
//     TouchableOpacity,
//     StyleSheet,
//     ActivityIndicator,
//     Platform,
//     Alert,
//     ScrollView,
//     TextInput,
// } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import { useLocalSearchParams } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const SERVER_URL = "http://192.168.0.202:8080";

// type ReportType =
//     | "USG"
//     | "ECG"
//     | "ECHO"
//     | "BLOOD_TEST"
//     | "URINE_TEST"
//     | "XRAY"
//     | "MRI"
//     | "CT"
//     | "VITALS"
//     | "DISCHARGE_SUMMARY"
//     | "OTHER";

// const REPORT_TYPES: { label: string; value: ReportType }[] = [
//     { label: "Ultrasound (USG)", value: "USG" },
//     { label: "ECG", value: "ECG" },
//     { label: "ECHO", value: "ECHO" },
//     { label: "Blood Test", value: "BLOOD_TEST" },
//     { label: "Urine Test", value: "URINE_TEST" },
//     { label: "X-Ray", value: "XRAY" },
//     { label: "MRI", value: "MRI" },
//     { label: "CT Scan", value: "CT" },
//     { label: "Vitals", value: "VITALS" },
//     { label: "Discharge Summary", value: "DISCHARGE_SUMMARY" },
//     { label: "Other", value: "OTHER" },
// ];

// interface OCRPreviewResponse {
//     dateSuggestion?: {
//         dates?: string[];
//         reason?: string;
//     };
// }

// const UploadReport: React.FC = () => {
//     const params = useLocalSearchParams<{ userId?: string }>();

//     const [selectedFile, setSelectedFile] =
//         useState<DocumentPicker.DocumentPickerAsset | null>(null);

//     const [uploading, setUploading] = useState<boolean>(false);
//     const [ocrLoading, setOcrLoading] = useState<boolean>(false);
//     const [userId, setUserId] = useState<string | null>(null);

//     const [suggestedDate, setSuggestedDate] = useState<string>("");
//     const [dateReason, setDateReason] = useState<string>("");
//     const [dateSource, setDateSource] = useState<"ocr" | "manual">("ocr");

//     const [reportName, setReportName] = useState<string>("");
//     const [reportType, setReportType] = useState<ReportType | "">("");
//     const [showForm, setShowForm] = useState<boolean>(false);

//     //   useEffect(() => {
//     //     const fetchUserId = async () => {
//     //       let user_id = params.userId;
//     //       if (!user_id) {
//     //         user_id = await AsyncStorage.getItem("user_id");
//     //       }
//     //       setUserId(user_id);
//     //     };
//     //     fetchUserId();
//     //   }, [params]);
//     useEffect(() => {
//         const fetchUserId = async () => {
//             const idFromParams = params.userId;
//             const idFromStorage = await AsyncStorage.getItem("user_id");

//             const resolvedUserId: string | null =
//                 idFromParams ?? idFromStorage ?? null;

//             setUserId(resolvedUserId);
//         };

//         fetchUserId();
//     }, [params.userId]);


//     const handleChooseFile = async (): Promise<void> => {
//         try {
//             const res = await DocumentPicker.getDocumentAsync({ type: "*/*" });

//             if (!res.canceled && res.assets.length > 0) {
//                 const file = res.assets[0];
//                 setSelectedFile(file);
//                 runOcrPreview(file);
//             }
//         } catch {
//             Alert.alert("Error", "Could not open file picker.");
//         }
//     };

//     const runOcrPreview = async (
//         file: DocumentPicker.DocumentPickerAsset
//     ): Promise<void> => {
//         try {
//             setOcrLoading(true);

//             const formData = new FormData();

//             if (Platform.OS === "web") {
//                 const response = await fetch(file.uri);
//                 const blob = await response.blob();
//                 formData.append("file", blob, file.name);
//             } else {
//                 formData.append("file", {
//                     uri: file.uri,
//                     type: file.mimeType ?? "application/octet-stream",
//                     name: file.name ?? "report.jpg",
//                 } as any);
//             }

//             const res = await fetch(`${SERVER_URL}/patient/ocr-preview`, {
//                 method: "POST",
//                 body: formData,
//             });

//             const data: OCRPreviewResponse = await res.json();

//             if (res.ok) {
//                 setSuggestedDate(data.dateSuggestion?.dates?.[0] ?? "");
//                 setDateReason(data.dateSuggestion?.reason ?? "");
//                 setShowForm(true);
//             } else {
//                 Alert.alert("OCR Error", "Could not extract date");
//             }
//         } catch {
//             Alert.alert("Error", "OCR failed");
//         } finally {
//             setOcrLoading(false);
//         }
//     };

//     const handleUploadFile = async (): Promise<void> => {
//         if (!selectedFile || !reportName || !suggestedDate) {
//             Alert.alert("Error", "Please fill all required fields.");
//             return;
//         }

//         if (!userId) {
//             Alert.alert("Error", "User ID not found.");
//             return;
//         }

//         setUploading(true);

//         try {
//             const formData = new FormData();

//             if (Platform.OS === "web") {
//                 const response = await fetch(selectedFile.uri);
//                 const blob = await response.blob();
//                 formData.append("file", blob, selectedFile.name);
//             } else {
//                 formData.append("file", {
//                     uri: selectedFile.uri,
//                     type: selectedFile.mimeType ?? "application/octet-stream",
//                     name: selectedFile.name ?? "report.jpg",
//                 } as any);
//             }

//             formData.append("user_id", userId);
//             formData.append("report_name", reportName);
//             formData.append("document_date", suggestedDate);
//             formData.append("date_source", dateSource);

//             if (reportType) {
//                 formData.append("report_type", reportType);
//             }

//             const response = await fetch(`${SERVER_URL}/patient/upload/report`, {
//                 method: "POST",
//                 body: formData,
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 Alert.alert("Success", "Report uploaded!");
//                 resetState();
//             } else {
//                 Alert.alert("Error", data.message || "Upload failed.");
//             }
//             if (response.ok) {
//                 Alert.alert(
//                     "Success!",
//                     "Report uploaded successfully",
//                     [
//                         {
//                             text: "OK",
//                             onPress: () => resetState(),
//                         },
//                     ],
//                     { cancelable: false }
//                 );
//                 return;
//             }

//         } catch {
//             Alert.alert("Error", "Upload failed.");
//         } finally {
//             setUploading(false);
//         }
//     };


//     const resetState = (): void => {
//         setSelectedFile(null);
//         setShowForm(false);
//         setReportName("");
//         setReportType("");
//         setSuggestedDate("");
//         setDateReason("");
//         setDateSource("ocr");
//     };

//     const canSubmit = reportName.trim() !== "" && suggestedDate.trim() !== "";

//     return (
//         <ScrollView contentContainerStyle={styles.container}>
//             <Image
//                 source={require("../assets/medical-bg.jpg")}
//                 style={styles.backgroundImage}
//                 resizeMode="cover"
//             />
//             <Text style={styles.title}>Upload Medical Report</Text>

//             {!selectedFile && (
//                 <TouchableOpacity style={styles.chooseButton} onPress={handleChooseFile}>
//                     <Text style={styles.buttonText}>Choose File</Text>
//                 </TouchableOpacity>
//             )}

//             {selectedFile && (
//                 <View style={styles.previewContainer}>
//                     <Text style={styles.fileName}>{selectedFile.name}</Text>

//                     {selectedFile.mimeType?.startsWith("image/") && (
//                         <Image
//                             source={{ uri: selectedFile.uri }}
//                             style={styles.imagePreview}
//                         />
//                     )}

//                     <TouchableOpacity style={styles.removeButton} onPress={resetState}>
//                         <Text style={styles.removeButtonText}>Remove</Text>
//                     </TouchableOpacity>
//                 </View>
//             )}

//             {ocrLoading && (
//                 <ActivityIndicator size="large" color="#007bff" />
//             )}

//             {showForm && (
//                 <View style={{ width: "100%", marginTop: 15 }}>
//                     <Text style={styles.label}>Report Name</Text>
//                     <TextInput
//                         style={styles.input}
//                         value={reportName}
//                         onChangeText={setReportName}
//                     />

//                     <Text style={styles.label}>Date of Report</Text>
//                     <TextInput
//                         style={styles.input}
//                         value={suggestedDate}
//                         onChangeText={(v) => {
//                             setSuggestedDate(v);
//                             setDateSource("manual");
//                         }}
//                     />

//                     <Text style={styles.helperText}>
//                         {dateSource === "ocr"
//                             ? `Detected from document: ${dateReason || "—"}`
//                             : "Date edited manually"}
//                     </Text>

//                     <Text style={styles.label}>Report Type (optional)</Text>

//                     {REPORT_TYPES.map((t) => (
//                         <TouchableOpacity
//                             key={t.value}
//                             style={[
//                                 styles.typeOption,
//                                 reportType === t.value && styles.typeOptionSelected,
//                             ]}
//                             onPress={() => setReportType(t.value)}
//                         >
//                             <Text>{t.label}</Text>
//                         </TouchableOpacity>
//                     ))}
//                 </View>
//             )}

//             {selectedFile && showForm && (
//                 <TouchableOpacity
//                     style={[
//                         styles.uploadButton,
//                         (!canSubmit || uploading) && styles.uploadButtonDisabled,
//                     ]}
//                     disabled={!canSubmit || uploading}
//                     onPress={handleUploadFile}
//                 >
//                     {uploading ? (
//                         <ActivityIndicator color="#fff" />
//                     ) : (
//                         <Text style={styles.uploadText}>Upload Report</Text>
//                     )}
//                 </TouchableOpacity>
//             )}
//         </ScrollView>
//     );
// };

// export default UploadReport;
// const styles = StyleSheet.create({
//     container: { flexGrow: 1, alignItems: "center", backgroundColor: "#f9f9f9", padding: 20 },
//     backgroundImage: {
//         position: "absolute",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//     },
//     title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
//     chooseButton: { backgroundColor: "#007bff", paddingVertical: 14, paddingHorizontal: 25, borderRadius: 10 },
//     buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
//     previewContainer: { alignItems: "center", marginBottom: 15 },
//     fileName: { fontSize: 16, marginBottom: 10 },
//     imagePreview: { width: 280, height: 280, borderRadius: 10, marginBottom: 10, resizeMode: "contain" },
//     removeButton: { backgroundColor: "#ff4444", paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 },
//     removeButtonText: { color: "#fff", fontWeight: "600" },
//     label: { fontWeight: "600", marginBottom: 6 },
//     helperText: { fontSize: 12, color: "#666", marginBottom: 6 },
//     input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: "#fff" },
//     typeOption: { padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 6 },
//     typeOptionSelected: { backgroundColor: "#d0ebff", borderColor: "#007bff" },
//     uploadButton: { backgroundColor: "#28a745", paddingVertical: 14, paddingHorizontal: 25, borderRadius: 10, marginTop: 20 },
//     uploadButtonDisabled: { backgroundColor: "#999" },
//     uploadText: { color: "#fff", fontSize: 17, fontWeight: "700" },
// });