import { GoogleGenerativeAI } from "@google/generative-ai";
const key = process.argv[2] || process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(key);

async function list() {
  try {
    const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy to get the SDK instance
    // The SDK might have a method, but I'll use fetch to be sure
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    console.log("MODELS:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("FAILURE:", error.message);
  }
}

list();
