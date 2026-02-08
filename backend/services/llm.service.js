// import axios from "axios";
// export const callLLM = async (prompt) => {
//   const response = await axios.post(
//     "http://localhost:11434/api/generate",
//     {
//       model: "minimax-m2:cloud", // ✅ CHANGE HERE
//       prompt,
//       stream: false,
//       options: {
//         temperature: 0.1,
//       },
//     },
//     {
//       timeout: 120000,
//     }
//   );

//   return response.data.response;
// };


import axios from "axios";

export const callLLM = async (prompt) => {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama3-70b-8192",
      messages: [
        {
          role: "system",
          content: "You are a medical document date extraction assistant."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      timeout: 60000
    }
  );

  return response.data.choices[0].message.content;
};
