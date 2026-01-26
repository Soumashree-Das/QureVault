import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "temp/",
  filename: (_, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

export const upload_forOCR = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// export upload_forOCR;




// import multer from "multer";
// import { storage } from "../config/cloudinary.js";

// export const upload = multer({ storage });


// // import multer from "multer";
// // import path from "path";

// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, "uploads/"); // make sure folder exists
// //   },
// //   filename: (req, file, cb) => {
// //     cb(null, Date.now() + path.extname(file.originalname));
// //   }
// // });
