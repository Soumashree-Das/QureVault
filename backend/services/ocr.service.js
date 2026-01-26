// v3
import axios from "axios";
import fs from "fs";
import FormData from "form-data";
import path from "path";

export const runOCR = async (localImagePath) => {
  const imageBuffer = fs.readFileSync(localImagePath);

  const formData = new FormData();
  formData.append("file", imageBuffer, {
    filename: path.basename(localImagePath),
    contentType: "image/jpeg",
  });

  formData.append("language", "eng");
  formData.append("OCREngine", "2");

  const response = await axios.post(
    "https://api.ocr.space/parse/image",
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        apikey: process.env.OCR_SPACE_API_KEY,
      },
      maxBodyLength: Infinity,
    }
  );

  const data = response.data;

  if (!data || data.IsErroredOnProcessing) {
    throw new Error(
      data?.ErrorMessage?.[0] || "OCR failed"
    );
  }

  return data.ParsedResults?.[0]?.ParsedText || "";
};


// // v2 -> works but cannot detect date most cases guve null
// import axios from "axios";
// import fs from "fs";
// import FormData from "form-data";
// import path from "path";

// export const runOCR = async (localImagePath) => {
//   // 1️⃣ Read file into Buffer (CRITICAL FIX)
//   const imageBuffer = fs.readFileSync(localImagePath);

//   // 2️⃣ Create form data
//   const formData = new FormData();
//   formData.append("file", imageBuffer, {
//     filename: path.basename(localImagePath),
//     contentType: "image/jpeg",
//   });

//   formData.append("language", "eng");
//   formData.append("isOverlayRequired", "false");
//   formData.append("OCREngine", "2"); // better handwriting

//   // 3️⃣ Send request
//   const response = await axios.post(
//     "https://api.ocr.space/parse/image",
//     formData,
//     {
//       headers: {
//         ...formData.getHeaders(),
//         apikey: process.env.OCR_SPACE_API_KEY,
//       },
//       maxBodyLength: Infinity,
//       maxContentLength: Infinity,
//     }
//   );

//   const data = response.data;

//   if (!data || data.IsErroredOnProcessing) {
//     throw new Error(
//       data?.ErrorMessage?.[0] || "OCR.Space processing failed"
//     );
//   }

//   return data.ParsedResults?.[0]?.ParsedText || "";
// };


// v1->failure due to credit card detail requirement by google
// import vision from "@google-cloud/vision";

// // create client once
// const client = new vision.ImageAnnotatorClient({
//   keyFilename: "config/qurevault-google-vision-key.json",
// });

// export const runOCR = async (imagePath) => {
//   const [result] = await client.textDetection(imagePath);

//   if (!result.textAnnotations || !result.textAnnotations.length) {
//     return "";
//   }

//   // Full detected text is always index 0
//   return result.textAnnotations[0].description;
// };
