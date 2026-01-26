export const extractDateFromText = (text) => {
  // Common medical date formats
  const datePatterns = [
    /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/,     // 12/09/2024 or 12-09-24
    /\b(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/,       // 2024-09-12
    /\b(\d{1,2}\s[A-Za-z]{3,9}\s\d{4})\b/,             // 12 September 2024
    /\b([A-Za-z]{3,9}\s\d{1,2},\s\d{4})\b/,            // Sept 12, 2024
  ];

  for (let pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return null;
};
