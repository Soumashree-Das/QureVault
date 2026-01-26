export const cleanOCRText = (text) => {
  if (!text) return "";

  return text
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
};
