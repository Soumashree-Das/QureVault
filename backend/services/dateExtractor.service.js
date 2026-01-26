// v4
import { extractDateCandidates } from "./ruleDateExtract.service.js";
import { suggestDateFromText } from "./dateSuggestion.service.js";
import { cleanOCRText } from "./ocrClean.service.js";

export const extractDateFromOCR = async (ocrText) => {
  const cleanedText = cleanOCRText(ocrText);

  // 1️⃣ rule-based first
  const candidates = extractDateCandidates(cleanedText);

  // 2️⃣ confident → stop
  if (candidates.length === 1 && candidates[0].confidence >= 0.7) {
    return {
      status: "suggested",
      dates: [candidates[0].value],
      reason: "Detected directly from document text",
    };
  }

  // 3️⃣ fallback → LLM
  return await suggestDateFromText(cleanedText);
};


// // v3
// import { extractDateCandidates } from "./ruleDateExtract.service.js";
// import { suggestDateFromText } from "./dateSuggestion.service.js";
// import { cleanOCRText } from "./ocrClean.service.js";

// export const extractDateFromOCR = async (ocrText) => {
//   const cleanedText = cleanOCRText(ocrText);

//   // 1️⃣ Rule-based extraction FIRST
//   const candidates = extractDateCandidates(cleanedText);

//   // 2️⃣ If confident → RETURN (NO LLM)
//   if (
//     candidates.length === 1 &&
//     candidates[0].confidence >= 0.7
//   ) {
//     return {
//       status: "suggested",
//       dates: [candidates[0].value],
//       reason: "Detected directly from document text",
//     };
//   }

//   // 3️⃣ Otherwise → LLM fallback
//   return await suggestDateFromText(cleanedText);
// };


// // v2-> working but bad
// export const extractDate = (text) => {
//   if (!text) return null;

//   const regex =
//     /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/;

//   const match = text.match(regex);
//   if (!match) return null;

//   const parsed = new Date(match[1]);
//   return isNaN(parsed) ? null : parsed;
// };


// // v1
// export const extractDate = (text) => {
//   if (!text) return null;

//   const regex =
//     /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/;

//   const match = text.match(regex);

//   if (!match) return null;

//   const parsed = new Date(match[1]);
//   return isNaN(parsed) ? null : parsed;
// };
