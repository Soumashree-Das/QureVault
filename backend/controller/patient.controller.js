import Patient from "../model/patient.model.js";
import QRCode from "qrcode";
import crypto from "crypto";

/* --------------------- UPDATE PATIENT PROFILE --------------------- */
export const updatePatientProfile = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const updates = req.body;

    if (!patient_id) {
      return res.status(400).json({ message: "patient_id is required in params" });
    }

    const allowedFields = ["age", "gender", "blood_group"];
    const sanitizedUpdates = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      patient_id,
      { $set: sanitizedUpdates },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found for this ID" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/* --------------------- GET QR CODE --------------------- */
export const getQrCode = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required in params" });
    }

    const patient = await Patient.findOne({ user_id });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found for this user_id" });
    }

    res.status(200).json({
      message: "QR code fetched successfully",
      patient_id: patient._id,
      user_id: patient.user_id,
      qr_code: patient.qr_code || null,
    });
  } catch (error) {
    console.error("getQrCode error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/* --------------------- UPLOAD REPORT --------------------- */
export const uploadReport = async (req, res) => {
  try {
    const { user_id, report_type } = req.body;

    if (!req.file) return res.status(400).json({ message: "File is required" });
    const file_url = req.file.path; // Cloudinary URL

    const patient = await Patient.findOne({ user_id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Add new report directly under patient.reports
    patient.reports.push({
      file_url,
      report_type,
      upload_date: new Date(),
    });

    await patient.save();
    res.json({ message: "Report uploaded successfully", reports: patient.reports });
  } catch (error) {
    console.error("uploadReport error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}; 

/* --------------------- UPLOAD PRESCRIPTION --------------------- */
export const uploadPrescription = async (req, res) => {
  try {
    const { user_id, medicine_list, extracted_text, source } = req.body;

    if (!req.file) return res.status(400).json({ message: "File is required" });
    const file_url = req.file.path;

    const patient = await Patient.findOne({ user_id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Add prescription directly to patient.prescriptions
    patient.prescriptions.push({
      file_url,
      medicine_list: medicine_list || [],
      extracted_text,
      source,
      upload_date: new Date(),
    });

    await patient.save();
    res.json({ message: "Prescription uploaded successfully", prescriptions: patient.prescriptions });
  } catch (error) {
    console.error("uploadPrescription error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/* --------------------- GENERATE PATIENT QR CODE --------------------- */
export const generatePatientQRCode = async (req, res) => {
  try {
    const { user_id } = req.params;
    const patient = await Patient.findOne({ user_id });

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    // Generate a unique token
    const uniqueCode = crypto.randomBytes(8).toString("hex");
    const qrData = JSON.stringify({
      user_id: patient.user_id,
      qr_token: uniqueCode,
    });

    // Generate QR image
    const qrCodeImage = await QRCode.toDataURL(qrData);

    // Save in DB
    patient.qr_code = qrCodeImage;
    patient.qr_token = uniqueCode;
    await patient.save();

    res.json({ message: "QR code generated successfully", qr_code: qrCodeImage });
  } catch (error) {
    console.error("generatePatientQRCode error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/* --------------------- GET PATIENT DATA BY QR CODE --------------------- */
export const getPatientDataByQRCode = async (req, res) => {
  try {
    const { qr_token, user_id } = req.body;

    const patient = await Patient.findOne({ user_id, qr_token });
    if (!patient) return res.status(404).json({ message: "Invalid or expired QR code" });

    const hasData =
      (patient.reports && patient.reports.length > 0) ||
      (patient.prescriptions && patient.prescriptions.length > 0);

    if (!hasData) {
      return res.json({ message: "Upload records to see here" });
    }

    res.json(patient);
  } catch (error) {
    console.error("getPatientDataByQRCode error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getAllRecords = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({ message: "user_id is required in params" });
    }

    // Fetch patient data
    const patient = await Patient.findOne({ user_id });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Combine all reports and prescriptions in one response
    const reports = patient.reports || [];
    const prescriptions = patient.prescriptions || [];

    // Optionally, merge them into one array with a "type" field
    const allRecords = [
      ...reports.map((r) => ({ type: "report", ...r.toObject() })),
      ...prescriptions.map((p) => ({ type: "prescription", ...p.toObject() })),
    ];

    // Sort by upload_date descending (newest first)
    allRecords.sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date));

    res.json({
      message: "All records fetched successfully",
      user_id: patient.user_id,
      total_records: allRecords.length,
      records: allRecords,
    });
  } catch (error) {
    console.error("getAllRecords error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};




// import Patient from "../model/patient.model.js";
// import QRCode from "qrcode";
// import fs from "fs";
// import path from "path";

// // export const upload = multer({ storage });

// //updat patient details
// export const updatePatientProfile = async (req, res) => {
//   try {
//     const { patient_id } = req.params; // now use patient_id instead of user_id
//     const updates = req.body;

//     console.log("Updating patient:", patient_id);
//     console.log("Updates:", updates);

//     if (!patient_id) {
//       return res.status(400).json({ message: "patient_id is required in params" });
//     }

//     const allowedFields = ["age", "gender", "blood_group"];
//     const sanitizedUpdates = {};

//     for (const key of allowedFields) {
//       if (updates[key] !== undefined) {
//         sanitizedUpdates[key] = updates[key];
//       }
//     }

//     const updatedPatient = await Patient.findByIdAndUpdate(
//       patient_id,
//       { $set: sanitizedUpdates },
//       { new: true, runValidators: true }
//     );

//     if (!updatedPatient) {
//       return res.status(404).json({ message: "Patient not found for this ID" });
//     }

//     res.status(200).json({
//       message: "Profile updated successfully",
//       patient_id: updatedPatient._id,
//       user_id: updatedPatient.user_id,
//       age: updatedPatient.age,
//       gender: updatedPatient.gender,
//       blood_group: updatedPatient.blood_group,
//       qr_code: updatedPatient.qr_code,
//     });
//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

// // Get patient details via QR scan
// export const getQrCode = async (req, res) => {
//   try {
//     // Accept user_id from params, query, or body (params preferred)
//     // const user_id = req.params.user_id || req.query.user_id || req.body.user_id;
//     const { user_id } = req.params;
//     console.log("user_id:",user_id);

//     if (!user_id) {
//       return res.status(400).json({ message: "user_id is required in params/query/body" });
//     }

//     // Find patient by the foreign key field `user_id`
//     const patient = await Patient.findOne({ user_id });

//     if (!patient) {
//       return res.status(404).json({ message: "Patient not found for this user_id" });
//     }

//     // Send the stored base64 QR image (or null if not present)
//     return res.status(200).json({
//       message: "QR code fetched successfully",
//       patient_id: patient._id,
//       user_id: patient.user_id,
//       qr_code: patient.qr_code || null,
//     });
//   } catch (error) {
//     console.error("getQrCode error:", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };



// // Upload a report
// // export const uploadReport = async (req, res) => {
// //   try {
// //     const { user_id, visit_date, report_type, extracted_text, source, confidence_score } = req.body;
// //     const file_url = req.file.path; // multer will store the uploaded file

// //     const patient = await Patient.findOne({ user_id });
// //     if (!patient) return res.status(404).json({ message: "Patient not found" });

// //     // Find or create visit
// //     let visit = patient.visits.find(v => v.date.toISOString() === new Date(visit_date).toISOString());
// //     if (!visit) {
// //       visit = { date: new Date(visit_date), doctor_id: null, prescriptions: [], reports: [] };
// //       patient.visits.push(visit);
// //     }

// //     visit.reports.push({
// //       file_url,
// //       report_type,
// //       extracted_text,
// //       source,
// //       confidence_score
// //     });

// //     await patient.save();
// //     res.json({ message: "Report uploaded successfully", patient });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };

// // export const uploadReport = async (req, res) => {
// //   try {
// //     const { user_id, visit_date, report_type, extracted_text, source, confidence_score } = req.body;

// //     if (!req.file) return res.status(400).json({ message: "File is required" });

// //     const file_url = req.file.path; // Cloudinary URL

// //     const patient = await Patient.findOne({ user_id });
// //     if (!patient) return res.status(404).json({ message: "Patient not found" });

// //     // Find or create visit
// //     let visit = patient.visits.find(v => v.date.toISOString() === new Date(visit_date).toISOString());
// //     if (!visit) {
// //       visit = { date: new Date(visit_date), doctor_id: null, prescriptions: [], reports: [] };
// //       patient.visits.push(visit);
// //     }

// //     visit.reports.push({
// //       file_url,
// //       report_type,
// //       extracted_text,
// //       source,
// //       confidence_score
// //     });

// //     await patient.save();
// //     res.json({ message: "Report uploaded successfully", patient });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };


// export const uploadReport = async (req, res) => {
//   try {
//     const { user_id, visit_date, report_type, extracted_text, source, confidence_score } = req.body;

//     if (!req.file) return res.status(400).json({ message: "File is required" });

//     const file_url = req.file.path; // Cloudinary URL

//     const patient = await Patient.findOne({ user_id });
//     if (!patient) return res.status(404).json({ message: "Patient not found" });

//     // Find or create visit
//     let visit = patient.visits.find(
//       (v) => v.date.toISOString() === new Date(visit_date).toISOString()
//     );

//     if (!visit) {
//       // Create a new Mongoose subdocument properly
//       patient.visits.push({
//         date: new Date(visit_date),
//         doctor_id: null,
//         prescriptions: [],
//         reports: [
//           {
//             file_url,
//             report_type
//             // extracted_text,
//             // source,
//             // confidence_score,
//           },
//         ],
//       });
//     } else {
//       // Modify an existing subdocument
//       visit.reports.push({
//         file_url,
//         report_type,
//         extracted_text,
//         source,
//         confidence_score,
//       });
//     }

//     // Tell Mongoose the nested field was changed
//     patient.markModified("visits");
//     await patient.save();

//     res.json({ message: "Report uploaded successfully", patient });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };



// // Upload a prescription
// // export const uploadPrescription = async (req, res) => {
// //   try {
// //     const { user_id, visit_date, medicine_list, extracted_text, source } = req.body;
// //     const file_url = req.file.path;

// //     const patient = await Patient.findOne({ user_id });
// //     if (!patient) return res.status(404).json({ message: "Patient not found" });

// //     // Find or create visit
// //     let visit = patient.visits.find(v => v.date.toISOString() === new Date(visit_date).toISOString());
// //     if (!visit) {
// //       visit = { date: new Date(visit_date), doctor_id: null, prescriptions: [], reports: [] };
// //       patient.visits.push(visit);
// //     }

// //     visit.prescriptions.push({
// //       file_url,
// //       medicine_list: medicine_list || [],
// //       extracted_text,
// //       source
// //     });

// //     await patient.save();
// //     res.json({ message: "Prescription uploaded successfully", patient });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };


// export const uploadPrescription = async (req, res) => {
//   try {
//     const { user_id, visit_date, medicine_list, extracted_text, source } = req.body;

//     // File validation (like uploadReport)
//     if (!req.file) return res.status(400).json({ message: "File is required" });

//     const file_url = req.file.path;

//     const patient = await Patient.findOne({ user_id });
//     if (!patient) return res.status(404).json({ message: "Patient not found" });

//     // Find or create visit (using ISO string match)
//     let visit = patient.visits.find(
//       v => v.date.toISOString() === new Date(visit_date).toISOString()
//     );
//     if (!visit) {
//       visit = {
//         date: new Date(visit_date),
//         doctor_id: null,
//         prescriptions: [],
//         reports: []
//       };
//       patient.visits.push(visit);
//     }

//     visit.prescriptions.push({
//       file_url,
//       medicine_list: medicine_list || [],
//       extracted_text,
//       source
//     });

//     await patient.save();
//     res.json({ message: "Prescription uploaded successfully", patient });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };


// // Generate unique QR code for patient
// // export const generatePatientQRCode = async (req, res) => {
// //   try {
// //     const { user_id } = req.params;
// //     const patient = await Patient.findOne({ user_id });
// //     if (!patient) return res.status(404).json({ message: "Patient not found" });

// //     // If patient already has a QR code, return it
// //     if (patient.qr_code) return res.json({ qr_code: patient.qr_code });

// //     // Generate QR code that encodes patient_id
// //     const qrData = `${patient._id}`;
// //     const qrCodeImage = await QRCode.toDataURL(qrData);

// //     patient.qr_code = qrCodeImage;
// //     await patient.save();

// //     res.json({ qr_code: qrCodeImage });
// //   } catch (error) {
// //     res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };
// export const generatePatientQRCode = async (req, res) => {
//   try {
//     const { user_id } = req.params;
//     const patient = await Patient.findOne({ user_id });

//     if (!patient) return res.status(404).json({ message: "Patient not found" });

//     // Generate a unique token (keeps data same, QR changes)
//     const uniqueCode = crypto.randomBytes(8).toString("hex");
//     const qrData = JSON.stringify({
//       user_id: patient.user_id,
//       qr_token: uniqueCode
//     });

//     // Generate QR image as base64
//     const qrCodeImage = await QRCode.toDataURL(qrData);

//     // Save QR in DB
//     patient.qr_code = qrCodeImage;
//     patient.qr_token = uniqueCode; // store token to validate later
//     await patient.save();

//     res.json({ qr_code: qrCodeImage });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };
// // Fetch patient data using QR code
// // export const getPatientDataByQRCode = async (req, res) => {
// //   try {
// //     const { qr_code } = req.body; // or params

// //     const patient = await Patient.findOne({ qr_code }).populate("visits.doctor_id", "name email");
// //     if (!patient) return res.status(404).json({ message: "Patient not found" });

// //     res.json(patient);
// //   } catch (error) {
// //     res.status(500).json({ message: "Server Error", error: error.message });
// //   }
// // };
// export const getPatientDataByQRCode = async (req, res) => {
//   try {
//     const { qr_token, user_id } = req.body;

//     const patient = await Patient.findOne({ user_id, qr_token }).populate("visits.doctor_id", "name email");
//     if (!patient) return res.status(404).json({ message: "Invalid or expired QR code" });

//     // If no data
//     const hasData =
//       patient.visits?.some(
//         visit => visit.reports?.length > 0 || visit.prescriptions?.length > 0
//       );

//     if (!hasData) {
//       return res.json({ message: "Upload records to see here" });
//     }

//     res.json(patient);
//   } catch (error) {
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };