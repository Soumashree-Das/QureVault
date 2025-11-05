// import express from "express";
// import multer from "multer";
// import path from "path";
// import { uploadReport, uploadPrescription } from "../controller/patient.controller.js";

// const router = express.Router();

// // Multer configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // Make sure this folder exists
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// // Routes
// router.post("/upload/report", upload.single("file"), uploadReport);
// router.post("/upload/prescription", upload.single("file"), uploadPrescription);

// export default router;

import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { uploadReport, uploadPrescription } from "../controller/patient.controller.js";

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer-Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "medical_reports",
    allowed_formats: ["jpg", "jpeg", "png", "pdf", "doc", "docx"],
    resource_type: "auto",
  },
});

const upload = multer({ storage });

// Routes
router.post("/upload/report", upload.single("file"), uploadReport);
router.post("/upload/prescription", upload.single("file"), uploadPrescription);

export default router;


// import express from "express";
// import {
//   updatePatientProfile,
//   // getPatientProfile,
//   uploadReport,
//   uploadPrescription,
//   generatePatientQRCode,
//   getPatientDataByQRCode,
//   getQrCode,
//   getAllRecords
// } from "../controller/patient.controller.js";
// // import { upload } from "../middleware/multer.js";
// import { upload } from "../middleware/upload.middleware.js";

// const router = express.Router();

// router.put("/profile/:patient_id", updatePatientProfile);
// router.get("/getQrCode/:user_id", getQrCode);
// router.get("/:user_id/records", getAllRecords);
// // router.post("/upload/report", upload.single("file"), uploadReport);
// // router.post("/upload/prescription", upload.single("file"), uploadPrescription);
// // router.post("/upload/report", upload.single("file"), uploadReport);
// router.post(
//   "/upload/report",
//   (req, res, next) => {
//     console.log("Incoming upload request headers:", req.headers);
//     next();
//   },
//   upload.single("file"),
//   uploadReport
// );

// // router.post("/upload/prescription", upload.single("file"), uploadPrescription);
// router.post(
//   "/upload/report",
//   upload.single("file"),
//   uploadReport
// );

// router.get("/qrcode/:user_id", generatePatientQRCode);
// router.post("/qrcode/data", getPatientDataByQRCode);

// export default router;
