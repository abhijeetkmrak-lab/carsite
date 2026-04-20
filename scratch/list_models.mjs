import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

async function listModels() {
  const envContent = fs.readFileSync(".env.local", "utf8");
  const apiKeyLine = envContent.split("\n").find(line => line.startsWith("GEMINI_API_KEY="));
  const apiKey = apiKeyLine ? apiKeyLine.split("=")[1].trim() : null;

  if (!apiKey) {
    console.error("No API key found in .env.local");
    return;
  }

  console.log("Using API Key:", apiKey.substring(0, 10) + "...");
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const result = await genAI.listModels();
    console.log("Available Models:");
    result.models.forEach((m) => {
      console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(", ")})`);
    });
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();
