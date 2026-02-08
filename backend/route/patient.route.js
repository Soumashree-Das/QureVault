import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { uploadReport,
  uploadPrescription,
  generatePatientQRCode,
  getPatientDataByQRCode,
  getQrCode,
  getAllRecords,
  updatePatientProfile,
  getPrescriptionFile,
  getReportFile,ocrPreview
} from "../controller/patient.controller.js";
import { upload_forOCR } from "../middleware/upload.middleware.js";
import { verifyAccessToken } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = express.Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isPdf = file.mimetype === "application/pdf";

    return {
      folder: "medical_records",
      resource_type: isPdf ? "raw" : "image",
      format: isPdf ? "pdf" : undefined,
      // access_mode: "authenticated",
       type: "private", 
    };
  },
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDFs are allowed"), false);
  }
};


// const upload = multer({ storage });
const upload = multer({
  storage,
  fileFilter,
  // limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Routes
// router.post("/upload/report", upload.single("file"), uploadReport);
router.post(
  "/upload/report",
  verifyAccessToken,
  requireRole("patient"),
  upload.single("file"),
  uploadReport
);
router.get(
  "/report/:reportId/file",
  verifyAccessToken,
  requireRole("patient"),
  getReportFile
);
router.post("/upload/prescription" , verifyAccessToken ,requireRole("patient"), upload.single("file") , uploadPrescription);
router.get(
  "/prescription/:prescriptionId/file",
  verifyAccessToken,
  requireRole("patient"),
  getPrescriptionFile
);
router.put("/profile" , verifyAccessToken , requireRole("patient"),updatePatientProfile);
router.get("/getQrCode" , verifyAccessToken , requireRole("patient"),getQrCode);
router.get("/records" , verifyAccessToken , requireRole("patient"),getAllRecords);
router.get("/qrcode/:user_id" ,requireRole("patient"), generatePatientQRCode);
router.post("/qrcode/data" , requireRole("patient"),getPatientDataByQRCode);
router.post(
  "/ocr-preview" ,
  upload_forOCR.single("file"),
  ocrPreview
);

export default router;





