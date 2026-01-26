const fullDateRegex =
  /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/;

const monthYearRegex =
  /\b(0?[1-9]|1[0-2])\s*(?:\/|-|\.)?\s*(20\d{2})\b/;

const yearRegex = /\b(20\d{2})\b/;

export const extractDateCandidates = (text) => {
  const candidates = [];

  const full = text.match(fullDateRegex);
  if (full) {
    const date = new Date(full[1]);
    if (!isNaN(date)) {
      candidates.push({
        type: "full",
        value: date.toISOString().slice(0, 10),
        confidence: 0.95,
      });
    }
  }

  const monthYear = text.match(monthYearRegex);
  if (monthYear) {
    candidates.push({
      type: "month_year",
      value: `${monthYear[2]}-${monthYear[1].padStart(2, "0")}`,
      confidence: 0.7,
    });
  }

  const year = text.match(yearRegex);
  if (year) {
    candidates.push({
      type: "year",
      value: year[1],
      confidence: 0.4,
    });
  }

  return candidates;
};
