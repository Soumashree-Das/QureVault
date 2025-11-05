import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup multer storage for Cloudinary
export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "patient_files", // folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "pdf"]
  }
});

export default cloudinary;
