import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDS1VZfwpolHIOz-Fc8PCYwDsySIB9akUk";
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        // For listing models, we don't need a specific model instance, 
        // but the SDK structure usually requires getting the model first or using the manager.
        // Actually, looking at the docs, it's not directly exposed on the main class in all versions.
        // Let's try a simple generation with a very standard model name first to test connectivity.
        // If that fails, we know it's the key or connection.

        console.log("Testing connection with 'gemini-1.5-flash'...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Success! Response:", result.response.text());

    } catch (error) {
        console.error("Error details:", error);
    }
}

listModels();
