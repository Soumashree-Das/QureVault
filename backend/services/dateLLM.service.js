// v1
// export const buildDatePrompt = (ocrText) => {
//   return `
// You are assisting with date extraction from medical documents.

// TASK:
// - Identify the most plausible document date from the OCR text.
// - If the date is explicit and clear, suggest ONE date.
// - If the date is ambiguous, suggest UP TO TWO plausible dates.
// - If no date can be inferred, say "not_found".

// RULES:
// - Do NOT guess.
// - Do NOT invent dates.
// - Use ISO format: YYYY-MM-DD.
// - Give a short reason (max 12 words).
// - Output JSON only.

// OCR TEXT:
// """
// ${ocrText}
// """
// `;
// };

// v2
export const buildDatePrompt = (ocrText) => {
  return `
You extract dates from medical documents.

DEFINITIONS:
- Date can be FULL (YYYY-MM-DD), PARTIAL (YYYY-MM), or YEAR_ONLY (YYYY)

RULES:
- Do NOT invent numbers
- If month is numeric and adjacent to year, output YYYY-MM
- Prefer more specific dates
- Output JSON only

OUTPUT FORMAT:
{
  "status": "suggested" | "not_found",
  "dates": string[],
  "reason": string
}

OCR TEXT:
"""
${ocrText}
"""
`;
};

