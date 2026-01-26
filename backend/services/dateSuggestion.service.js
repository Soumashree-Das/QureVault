// v3
import { buildDatePrompt } from "./dateLLM.service.js";
import { callLLM } from "./llm.service.js";

export const suggestDateFromText = async (ocrText) => {
  const prompt = buildDatePrompt(ocrText);
  const rawResponse = await callLLM(prompt);

  const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("LLM did not return JSON");

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    status:
      parsed.status ||
      (parsed.date || parsed.dates ? "suggested" : "not_found"),
    dates: Array.isArray(parsed.dates)
      ? parsed.dates
      : parsed.date
      ? [parsed.date]
      : [],
    reason: parsed.reason || parsed.explanation || "Suggested from text",
  };
};



// // v2

// import { buildDatePrompt } from "./dateLLM.service.js";
// import { callLLM } from "./llm.service.js";

// export const suggestDateFromText = async (ocrText) => {
//   const prompt = buildDatePrompt(ocrText);

//   const rawResponse = await callLLM(prompt);

// console.log("RAW LLM RESPONSE:\n", rawResponse);


//   // 🔐 Extract JSON safely
//   const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);

//   if (!jsonMatch) {
//     throw new Error("LLM did not return JSON");
//   }

//   const parsed = JSON.parse(jsonMatch[0]);

//   // Optional but recommended validation
//   if (
//     !parsed.status ||
//     !Array.isArray(parsed.dates) ||
//     !parsed.reason
//   ) {
//     throw new Error("Invalid LLM response schema");
//   }

//   return parsed;
// };

// // // v1
// // export const suggestDateFromText = async (ocrText) => {
// //   const prompt = buildDatePrompt(ocrText);

// //   const rawResponse = await callLLM(prompt);

// //   // 🔐 Extract JSON safely
// //   const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);

// //   if (!jsonMatch) {
// //     throw new Error("LLM did not return JSON");
// //   }

// //   return JSON.parse(jsonMatch[0]);
// // };
