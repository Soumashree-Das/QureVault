const normalizeName = (name = "") => {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // remove brackets
    .replace(/pharmacy|medicos|medical|store/g, "")
    .trim();
};
