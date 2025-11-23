import { GoogleGenerativeAI } from "@google/generative-ai";

// NOTE: In a production app, this should be in an environment variable or secure backend.
// For this prototype, we are using the key provided by the user.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDS1VZfwpolHIOz-Fc8PCYwDsySIB9akUk";

const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeProject = async (projectInfo, fileContents = []) => {
  // List of models available for this specific API key
  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting to use model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });

      let prompt = `
        Act as a Human Rights Impact Assessment (HRIA) Expert.
        Analyze the following project and identify key human rights risks.
        IMPORTANT: Provide the output in THAI language only.

        Project Name: ${projectInfo.name}
        Type: ${projectInfo.type}
        Sector: ${projectInfo.sector}
        
        Context/Description:
        ${projectInfo.description || "No description provided."}
      `;

      if (fileContents.length > 0) {
        prompt += `\n\nAttached Document Contents:\n${fileContents.join("\n\n")}`;
      }

      prompt += `
        \n\nPlease provide the output in the following JSON format ONLY (no markdown code blocks):
        {
          "risks": [
            {
              "title": "Risk Title (Thai)",
              "description": "Brief description of the risk (Thai).",
              "severity": "High/Medium/Low",
              "rights_affected": ["Right to Health", "Right to Water", etc. (Thai)"]
            }
          ],
          "positive_impacts": [
            {
              "title": "Positive Impact Title (Thai)",
              "description": "Brief description of the positive impact (Thai)."
            }
          ],
          "recommendations": [
            "Recommendation 1 (Thai)",
            "Recommendation 2 (Thai)"
          ],
          "suggested_questions": [
            {
              "category": "Category Name (Thai)",
              "text": "Question text? (Thai)",
              "guidance": "Guidance for the assessor (Thai).",
              "riskWarning": "Warning if not addressed (Thai)."
            }
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean up markdown code blocks if present
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(cleanText);
    } catch (error) {
      console.warn(`Model ${modelName} failed:`, error);
      lastError = error;
      // Continue to next model
    }
  }

  // If all models fail
  console.error("All AI models failed:", lastError);
  throw new Error(`All AI models failed. Last error: ${lastError.message}`);
};

export const chatWithAI = async (message, context = null) => {
  // List of models available for this specific API key
  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      let prompt = `
        Act as a Human Rights Impact Assessment (HRIA) Expert Consultant.
        Your goal is to assist users in understanding and conducting HRIA.
        Answer questions clearly, professionally, and concisely in THAI language.

        User Message: ${message}
      `;

      if (context) {
        prompt += `
          \n\nCurrent Assessment Context:
          Project Name: ${context.info?.name || 'N/A'}
          Type: ${context.info?.type || 'N/A'}
          Sector: ${context.info?.sector || 'N/A'}
          Description: ${context.info?.description || 'N/A'}
        `;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn(`Chat model ${modelName} failed:`, error);
      lastError = error;
      // Continue to next model
    }
  }

  console.error("All Chat AI models failed:", lastError);
  throw new Error("ขออภัย ระบบ AI ไม่สามารถตอบกลับได้ในขณะนี้ (All models failed)");
};
