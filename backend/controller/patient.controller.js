import Patient from "../model/patient.model.js";
import QRCode from "qrcode";
import crypto from "crypto";
import { runOCR } from "../services/ocr.service.js";
import { extractDateFromOCR } from "../services/dateExtractor.service.js";
import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

// /* --------------------- OCR PREVIEW --------------------- */

export const ocrPreview = async (req, res) => {
  let localPath;

  // const ocrText = await runOCR(req.file.path);

  // const dateSuggestion = await extractDateFromOCR(ocrText);

  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({
        error: "Local image file is required for OCR preview",
      });
    }

    localPath = req.file.path;
    // console.log("OCR local file path:", localPath);

    // 1️⃣ OCR → TEXT
    const extractedText = await runOCR(localPath);

    // 2️⃣ DATE EXTRACTION (RULES → LLM fallback)
    const dateSuggestion = await extractDateFromOCR(extractedText);

    return res.json({
      extractedText,
      dateSuggestion,
    });

  } catch (err) {
    console.error("OCR PREVIEW ERROR:", err);
    return res.status(500).json({ error: "OCR preview failed" });

  } finally {
    if (localPath && fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }
};

/* --------------------- UPDATE PATIENT PROFILE --------------------- */

// v3 -> based on jwt
export const updatePatientProfile = async (req, res) => {
  try {
    const userId = req.user.userId;   // 🔐 source of truth
    const updates = req.body || {};

    const allowedFields = ["name", "age", "gender", "blood_group"];
    const sanitizedUpdates = {};

    for (const key of allowedFields) {
      if (updates.hasOwnProperty(key)) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    if (sanitizedUpdates.name !== undefined) {
      if (typeof sanitizedUpdates.name !== "string") {
        return res.status(400).json({ message: "Invalid name" });
      }
    }


    // validate age
    if (sanitizedUpdates.age !== undefined) {
      const ageNum = Number(sanitizedUpdates.age);
      if (Number.isNaN(ageNum) || ageNum <= 0) {
        return res.status(400).json({ message: "Age must be a valid number" });
      }
      sanitizedUpdates.age = ageNum;
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // 🔥 KEY LOGIC CHANGE
    const patient = await Patient.findOneAndUpdate(
      { user_id: userId },            // 👈 ownership enforced
      { $set: sanitizedUpdates },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found for user" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      patient,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* --------------------- GET QR CODE --------------------- */

// v2 -> jwt based
export const getQrCode = async (req, res) => {
  try {
    const userId = req.user.userId; // 👈 from JWT

    const patient = await Patient.findOne({ user_id: userId });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      message: "QR code fetched successfully",
      patient_id: patient._id,
      qr_code: patient.qr_code || null,
    });
  } catch (error) {
    console.error("getQrCode error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


/* --------------------- UPLOAD REPORT --------------------- */

// v3 — JWT based (SECURE)
export const uploadReport = async (req, res) => {
  try {
    const userId = req.user.userId; // 🔐 source of truth

    const {
      report_name,
      report_type,
      document_date,
      date_source,
    } = req.body;

    // 1️⃣ Validate file
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    // 2️⃣ Validate fields
    // if (!report_name || !document_date) {
    //   return res.status(400).json({
    //     message: "Report name and document date are required",
    //   });
    // }
    const finalReportName = report_name?.trim() || "Report";

    const file_public_id = req.file.filename;
    // const file_url = req.file.path;

    // 3️⃣ Find patient by JWT userId
    const patient = await Patient.findOne({ user_id: userId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // 4️⃣ Push validated report
    patient.reports.push({
      file_public_id,
      // file_url,
      report_name: finalReportName,
      report_type: report_type || "OTHER",
      document_date: new Date(document_date),
      date_source: date_source === "manual" ? "manual" : "ocr",
      upload_date: new Date(),
    });

    await patient.save();

    return res.status(200).json({
      message: "Report uploaded successfully",
      report: patient.reports.at(-1),
    });

  } catch (error) {
    console.error("uploadReport error:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};
/* --------------------- GET REPORT FILE --------------------- */
export const getReportFile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { reportId } = req.params;

    // 1️⃣ Find patient (ownership enforced)
    const patient = await Patient.findOne({ user_id: userId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // 2️⃣ Find report by subdocument ID
    const report = patient.reports.id(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // 3️⃣ Generate signed Cloudinary URL
    const signedUrl = cloudinary.url(
      report.file_public_id,
      {
        type: "private",
        sign_url: true,
        expires_at: Math.floor(Date.now() / 1000) + 300, // 5 minutes
      }
    );

    // 4️⃣ Return signed URL
    res.json({ url: signedUrl });

  } catch (error) {
    console.error("getReportFile error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



/* --------------------- UPLOAD PRESCRIPTION --------------------- */
export const getPrescriptionFile = async (req, res) => {
  const userId = req.user.userId;
  const { prescriptionId } = req.params;

  const patient = await Patient.findOne({ user_id: userId });
  if (!patient) return res.status(404).json({ message: "Patient not found" });

  const prescription = patient.prescriptions.id(prescriptionId);
  if (!prescription)
    return res.status(404).json({ message: "Prescription not found" });

  const signedUrl = cloudinary.url(
    prescription.file_public_id,
    {
      type: "private",
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 300 // 5 minutes
    }
  );

  res.json({ url: signedUrl });
};

// v4 — JWT based (SECURE)
export const uploadPrescription = async (req, res) => {
  try {
    const userId = req.user.userId; // 🔐 source of truth

    const {
      prescription_name,
      extracted_text,
      medicine_list,
      document_date,
      date_source
    } = req.body;

    // 1️⃣ Validate file
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    // 2️⃣ Validate required fields
    if (!prescription_name) {
      return res.status(400).json({
        message: "Prescription name is required"
      });
    }

    const finalPrescriptionName =
      prescription_name?.trim() || "Prescription";
    const file_public_id = req.file.filename;
    // const file_url = req.file.path;

    // 3️⃣ Find patient by JWT userId
    const patient = await Patient.findOne({ user_id: userId });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // 4️⃣ Push validated prescription
    patient.prescriptions.push({
      file_public_id,
      // file_url,
      prescription_name: finalPrescriptionName,
      extracted_text,
      medicine_list: Array.isArray(medicine_list) ? medicine_list : [],
      document_date: document_date ? new Date(document_date) : undefined,
      date_source: date_source === "manual" ? "manual" : "ocr",
      upload_date: new Date()
    });

    await patient.save();

    return res.status(200).json({
      message: "Prescription uploaded successfully",
      prescription: patient.prescriptions.at(-1)
    });

  } catch (error) {
    console.error("uploadPrescription error:", error);
    res.status(500).json({
      message: "Server Error"
    });
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

// v2
export const getAllRecords = async (req, res) => {
  try {
    const userId = req.user.userId; // 🔐 from JWT

    const patient = await Patient.findOne({ user_id: userId });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const reports = patient.reports || [];
    const prescriptions = patient.prescriptions || [];

    const allRecords = [
      ...reports.map((r) => ({ type: "report", ...r.toObject() })),
      ...prescriptions.map((p) => ({ type: "prescription", ...p.toObject() })),
    ];

    allRecords.sort(
      (a, b) =>
        new Date(b.upload_date).getTime() -
        new Date(a.upload_date).getTime()
    );

    res.status(200).json({
      message: "All records fetched successfully",
      total_records: allRecords.length,
      records: allRecords,
    });
  } catch (error) {
    console.error("getAllRecords error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
