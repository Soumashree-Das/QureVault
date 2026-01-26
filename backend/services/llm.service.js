import axios from "axios";
export const callLLM = async (prompt) => {
  const response = await axios.post(
    "http://localhost:11434/api/generate",
    {
      model: "minimax-m2:cloud", // ✅ CHANGE HERE
      prompt,
      stream: false,
      options: {
        temperature: 0.1,
      },
    },
    {
      timeout: 120000,
    }
  );

  return response.data.response;
};

