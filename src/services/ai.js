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
        You are an Expert Human Rights Impact Assessment (HRIA) Analyst with deep knowledge of:
        - Universal Declaration of Human Rights (UDHR)
        - International Covenant on Civil and Political Rights (ICCPR)
        - International Covenant on Economic, Social and Cultural Rights (ICESCR)
        - UN Guiding Principles on Business and Human Rights (UNGPs)
        - ILO Core Conventions
        - Environmental and social safeguards frameworks

        CRITICAL: All output must be in THAI language only.

        PROJECT INFORMATION:
        Name: ${projectInfo.name}
        Type: ${projectInfo.type}
        Sector: ${projectInfo.sector}
        Description: ${projectInfo.description || "ไม่มีรายละเอียด"}
      `;

      if (fileContents.length > 0) {
        prompt += `

        ========================================
        DOCUMENT CONTENTS FOR ANALYSIS:
        ========================================
        ${fileContents.join("\n\n")}
        ========================================
        `;
      }

      prompt += `

        ⚠️ CRITICAL ANALYSIS RULES - READ CAREFULLY:

        1. EVIDENCE-BASED ANALYSIS ONLY
           - You MUST analyze ONLY what is explicitly stated in the documents provided above
           - DO NOT make assumptions or infer information not present in the documents
           - DO NOT add generic risks that are not mentioned in the documents
           - If documents are not provided or are insufficient, state this clearly
           - Every risk and impact MUST be traceable to specific content in the documents

        2. DOCUMENT READING METHODOLOGY
           - Read the entire document content carefully and thoroughly
           - Identify specific sections, paragraphs, or statements that indicate risks or impacts
           - Extract exact phrases or sentences that support your findings
           - Cross-reference multiple parts of the document for comprehensive understanding
           - Note what is NOT mentioned in the documents (gaps in information)

        3. RISK IDENTIFICATION CRITERIA
           A risk is valid ONLY if:
           - It is explicitly mentioned or clearly implied in the document content
           - You can quote or reference the specific part of the document
           - It relates to actual project activities, locations, or stakeholders mentioned
           - It is based on factual statements, not hypothetical scenarios

        4. POSITIVE IMPACT IDENTIFICATION
           A positive impact is valid ONLY if:
           - It is explicitly stated in the documents as a benefit or positive outcome
           - It is part of the project's stated objectives or expected results
           - It is mentioned in relation to specific communities or rights-holders
           - You can cite the exact source from the documents

        5. WHAT TO DO IF DOCUMENTS ARE INSUFFICIENT
           If the provided documents do not contain enough information:
           - State clearly in the description: "ข้อมูลในเอกสารไม่เพียงพอสำหรับการประเมิน"
           - Generate questions that would help gather the missing information
           - Do NOT fabricate risks or impacts based on general sector knowledge
           - Focus questions on obtaining specific information from the documents

        ANALYSIS FRAMEWORK - Apply to DOCUMENT CONTENT ONLY:

        SUBSTANTIVE RIGHTS (analyze only if mentioned in documents):
        - Right to Life, Liberty and Security
        - Right to Health and Healthcare
        - Right to Water and Sanitation
        - Right to Food and Adequate Standard of Living
        - Right to Housing and Adequate Shelter
        - Right to Work and Fair Working Conditions
        - Right to Education
        - Right to Freedom of Expression and Information
        - Right to Participation in Public Affairs
        - Right to Culture and Cultural Heritage
        - Rights of Indigenous Peoples
        - Environmental Rights (Clean Air, Healthy Environment)
        - Right to Property and Land Rights
        - Right to Privacy and Data Protection

        PROCEDURAL RIGHTS (analyze only if mentioned in documents):
        - Right to Information and Transparency
        - Right to Participation and Free, Prior and Informed Consent (FPIC)
        - Right to Remedy and Access to Justice
        - Right to Non-Discrimination and Equality

        RISK SEVERITY ASSESSMENT (based on document evidence):
        - HIGH: Document explicitly mentions severe impacts, vulnerable groups affected, or fundamental rights violations
        - MEDIUM: Document mentions moderate concerns or potential issues requiring attention
        - LOW: Document mentions minor issues or temporary effects

        OUTPUT FORMAT (JSON only, no markdown):
        {
          "risks": [
            {
              "title": "ชื่อความเสี่ยงที่ระบุชัดเจนในเอกสาร",
              "description": "คำอธิบายโดยละเอียดพร้อมอ้างอิงข้อความจากเอกสาร เช่น 'ตามที่ระบุในเอกสารว่า...' หรือ 'เอกสารกล่าวถึง...' ระบุกลุ่มที่ได้รับผลกระทบตามที่เอกสารระบุ",
              "severity": "High/Medium/Low (ตามหลักฐานในเอกสาร)",
              "rights_affected": ["สิทธิที่เอกสารระบุว่าได้รับผลกระทบ"],
              "document_reference": "อ้างอิงส่วนของเอกสารที่พบข้อมูลนี้"
            }
          ],
          "positive_impacts": [
            {
              "title": "ชื่อผลกระทบเชิงบวกที่ระบุในเอกสาร",
              "description": "คำอธิบายโดยละเอียดพร้อมอ้างอิงข้อความจากเอกสาร ระบุกลุ่มผู้รับประโยชน์ตามที่เอกสารระบุ",
              "document_reference": "อ้างอิงส่วนของเอกสารที่พบข้อมูลนี้"
            }
          ],
          "recommendations": [
            "ข้อเสนอแนะที่เฉพาะเจาะจงตามช่องว่างหรือจุดอ่อนที่พบในเอกสาร ไม่ใช่ข้อเสนอแนะทั่วไป"
          ],
          "suggested_questions": [
            {
              "category": "หมวดหมู่ของคำถาม (ตามประเด็นที่พบในเอกสาร)",
              "text": "คำถามเฉพาะเจาะจงเพื่อตรวจสอบข้อมูลที่พบในเอกสาร หรือเพื่อขอข้อมูลเพิ่มเติมในส่วนที่เอกสารไม่ได้ระบุ ลงท้ายด้วย ใช่หรือไม่",
              "guidance": "คำแนะนำสำหรับผู้ประเมิน อ้างอิงส่วนของเอกสารที่เกี่ยวข้อง",
              "riskWarning": "คำเตือนตามความเสี่ยงที่ระบุในเอกสาร"
            }
          ],
          "document_analysis_notes": "สรุปสั้น ๆ ว่าเอกสารมีข้อมูลเพียงพอหรือไม่ มีช่องว่างข้อมูลอะไรบ้าง"
        }

        QUALITY STANDARDS FOR EVIDENCE-BASED ANALYSIS:
        - Generate risks ONLY from document content (not generic sector risks)
        - Generate positive impacts ONLY from document content (not assumed benefits)
        - Generate 3-8 actionable recommendations based on document gaps
        - Generate 8-15 assessment questions that:
          * Verify information stated in the documents
          * Seek clarification on ambiguous points in the documents
          * Request missing information not covered in the documents
        - All questions MUST be CLOSED-ENDED (Yes/No questions)
        - All questions MUST end with "ใช่หรือไม่"
        - All questions must be answerable with: ใช่, ใช่บางส่วน, or ไม่ใช่
        - Include document_reference field to show evidence trail
        - Add document_analysis_notes to indicate data quality and gaps
        - Use Thai language that is professional yet accessible
        - Be honest about limitations - if documents lack information, say so

        ⚠️ CRITICAL QUESTION FORMAT RULES - READ CAREFULLY:
        
        Questions MUST be CLOSED-ENDED (answerable with Yes/No/Partial):
        
        ✅ CORRECT - Closed-ended questions (Good examples):
        - "โครงการมีการประเมินผลกระทบต่อสิ่งแวดล้อมก่อนดำเนินการ ใช่หรือไม่"
        - "มีการจัดทำแผนการมีส่วนร่วมของชุมชนในโครงการ ใช่หรือไม่"
        - "โครงการได้รับการอนุมัติจากหน่วยงาน EIA แล้ว ใช่หรือไม่"
        - "นโยบายพลังงานแห่งชาติมีเป้าหมายลดการปล่อยก๊าซเรือนกระจก ใช่หรือไม่"
        - "โครงการมีมาตรการป้องกันผลกระทบต่อสุขภาพของชุมชน ใช่หรือไม่"
        - "มีการกำหนดกลไกการเยียวยาผู้ได้รับผลกระทบไว้ชัดเจน ใช่หรือไม่"
        
        ❌ WRONG - Open-ended questions (DO NOT USE THESE):
        - "นโยบายพลังงานแห่งชาติมีเป้าหมายหลักอะไรบ้าง ใช่หรือไม่" (This is open-ended!)
        - "โครงการส่งผลกระทบต่อชุมชนอย่างไร ใช่หรือไม่" (This is open-ended!)
        - "มีมาตรการอะไรบ้างในการป้องกัน ใช่หรือไม่" (This is open-ended!)
        - "ใครเป็นผู้รับผิดชอบโครงการ ใช่หรือไม่" (This is open-ended!)
        
        HOW TO CONVERT OPEN-ENDED TO CLOSED-ENDED:
        ❌ "นโยบายมีเป้าหมายอะไรบ้าง ใช่หรือไม่"
        ✅ "นโยบายมีเป้าหมายลดการใช้พลังงานฟอสซิล ใช่หรือไม่"
        
        ❌ "โครงการส่งผลกระทบอย่างไร ใช่หรือไม่"
        ✅ "โครงการส่งผลกระทบต่อคุณภาพอากาศในพื้นที่ ใช่หรือไม่"
        
        ❌ "มีมาตรการอะไรบ้าง ใช่หรือไม่"
        ✅ "มีมาตรการติดตามตรวจสอบคุณภาพน้ำอย่างสม่ำเสมอ ใช่หรือไม่"

        EXAMPLES OF GOOD vs BAD ANALYSIS:

        ❌ BAD (Generic, not from documents):
        {
          "title": "ความเสี่ยงต่อคุณภาพน้ำ",
          "description": "โครงการอาจส่งผลกระทบต่อคุณภาพน้ำในพื้นที่"
        }

        ✅ GOOD (Evidence-based):
        {
          "title": "ความเสี่ยงต่อคุณภาพน้ำในลำน้ำชี",
          "description": "ตามที่ระบุในเอกสารหน้า 12 ว่า 'โครงการจะปล่อยน้ำเสียจากกระบวนการผลิตลงสู่ลำน้ำชีโดยตรง' ซึ่งอาจส่งผลกระทบต่อชุมชน 5 หมู่บ้านที่ใช้น้ำจากแม่น้ำสายนี้ตามที่เอกสารระบุในหน้า 15",
          "document_reference": "หน้า 12: การจัดการน้ำเสีย, หน้า 15: ชุมชนผู้ได้รับผลกระทบ"
        }

        Remember: Your credibility depends on accurate, evidence-based analysis. Do not speculate or assume.
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
