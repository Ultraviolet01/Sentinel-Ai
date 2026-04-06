import { GoogleGenerativeAI } from "@google/generative-ai";
const key = process.argv[2] || process.env.GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(key);

async function test() {
  try {
    // Testing gemini-flash-latest to bypass the 1.5-flash 404
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Hello, respond in JSON: {\"test\": true}");
    const response = await result.response;
    console.log("SUCCESS:", response.text());
  } catch (error) {
    console.error("FAILURE:", error.message);
  }
}

test();
