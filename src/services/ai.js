import { GoogleGenerativeAI } from "@google/generative-ai";

// API Key must be set in .env file as VITE_GEMINI_API_KEY
// See .env.example for reference
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error(
    "VITE_GEMINI_API_KEY is not set. Please create a .env file with your API key. " +
    "See .env.example for reference."
  );
}

const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeProject = async (projectInfo, fileContents = []) => {
  // List of models available for this specific API key
  const modelsToTry = [
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro"
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
        - **CRITICAL: DO NOT JUST SUMMARIZE THE DOCUMENT.**
        - **ANALYZE IMPLICATIONS:** You must infer potential risks and benefits based on the content.
          * Example: If a document says "Project will use groundwater", do NOT just say "Project uses groundwater".
          * Instead, ANALYZE: "Risk of water scarcity for local communities due to project's groundwater usage."
        - **EXPLAIN "HOW":** For every risk/benefit, explain HOW the document content leads to that impact.
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
        
        YOU MUST CREATE ONLY CLOSED-ENDED QUESTIONS (YES/NO QUESTIONS).
        ABSOLUTELY NO OPEN-ENDED QUESTIONS ALLOWED.
        
        A CLOSED-ENDED question makes a STATEMENT and asks if it is true.
        An OPEN-ENDED question asks "what", "how", "why", "when", "where", "who".
        
        ✅ CORRECT FORMAT - Closed-ended questions:
        Structure: [Statement about specific fact/action/condition] + ใช่หรือไม่
        
        Examples:
        - "โครงการมีการประเมินผลกระทบต่อสิ่งแวดล้อมก่อนดำเนินการ ใช่หรือไม่"
        - "มีการจัดทำแผนการมีส่วนร่วมของชุมชนในโครงการ ใช่หรือไม่"
        - "โครงการได้รับการอนุมัติจากหน่วยงาน EIA แล้ว ใช่หรือไม่"
        - "นโยบายมีเป้าหมายลดการปล่อยก๊าซเรือนกระจกร้อยละ 20 ภายในปี 2030 ใช่หรือไม่"
        - "โครงการมีมาตรการป้องกันผลกระทบต่อสุขภาพของชุมชน ใช่หรือไม่"
        - "มีการกำหนดกลไกการเยียวยาผู้ได้รับผลกระทบไว้ชัดเจนในเอกสาร ใช่หรือไม่"
        - "โครงการจะจ้างแรงงานในพื้นที่อย่างน้อย 100 คน ใช่หรือไม่"
        - "มีการจัดตั้งคณะกรรมการติดตามตรวจสอบผลกระทบ ใช่หรือไม่"
        
        ❌ WRONG FORMAT - Open-ended questions (NEVER USE):
        These contain question words and cannot be answered with Yes/No:
        
        - "นโยบายพลังงานแห่งชาติมีเป้าหมายหลักอะไรบ้าง ใช่หรือไม่" ❌ (contains "อะไรบ้าง")
        - "โครงการส่งผลกระทบต่อชุมชนอย่างไร ใช่หรือไม่" ❌ (contains "อย่างไร")
        - "มีมาตรการอะไรบ้างในการป้องกัน ใช่หรือไม่" ❌ (contains "อะไรบ้าง")
        - "ใครเป็นผู้รับผิดชอบโครงการ ใช่หรือไม่" ❌ (contains "ใคร")
        - "โครงการจะดำเนินการเมื่อไหร่ ใช่หรือไม่" ❌ (contains "เมื่อไหร่")
        - "พื้นที่ดำเนินโครงการอยู่ที่ไหน ใช่หรือไม่" ❌ (contains "ที่ไหน")
        - "ทำไมต้องมีการประเมินผลกระทบ ใช่หรือไม่" ❌ (contains "ทำไม")
        
        ⚠️ CRITICAL: FORBIDDEN QUESTION WORDS - ABSOLUTELY NO EXCEPTIONS:
        
        YOU MUST NEVER USE THESE WORDS IN ANY QUESTION:
        - อะไร (what)
        - อะไรบ้าง (what are / what things)
        - ใด (which / what)
        - ใดบ้าง (which ones)
        - อย่างไร (how)
        - ทำไม (why)
        - เพราะอะไร (why / because of what)
        - เมื่อไหร่ (when)
        - ที่ไหน (where)
        - ใคร (who)
        - เท่าไหร่ (how much/many)
        - กี่ (how many)
        - ช่วงไหน (which period)
        - ประเภทใด (what type)
        - ลักษณะใด (what kind)
        
        ⚠️ IF YOU USE ANY OF THESE WORDS, THE QUESTION IS AUTOMATICALLY WRONG!
        
        HOW TO CONVERT OPEN-ENDED TO CLOSED-ENDED:
        
        ❌ "นโยบายมีเป้าหมายอะไรบ้าง ใช่หรือไม่"
        ✅ "นโยบายมีเป้าหมายลดการใช้พลังงานฟอสซิลร้อยละ 30 ใช่หรือไม่"
        
        ❌ "โครงการส่งผลกระทบอย่างไร ใช่หรือไม่"
        ✅ "โครงการส่งผลกระทบต่อคุณภาพอากาศในพื้นที่ ใช่หรือไม่"
        
        ❌ "มีมาตรการอะไรบ้าง ใช่หรือไม่"
        ✅ "มีมาตรการติดตามตรวจสอบคุณภาพน้ำอย่างสม่ำเสมอ ใช่หรือไม่"
        
        ❌ "ใครเป็นผู้รับผิดชอบ ใช่หรือไม่"
        ✅ "กระทรวงพลังงานเป็นหน่วยงานรับผิดชอบหลักของโครงการ ใช่หรือไม่"
        
        ❌ "โครงการจะเริ่มเมื่อไหร่ ใช่หรือไม่"
        ✅ "โครงการจะเริ่มดำเนินการในปี 2025 ใช่หรือไม่"
        
        ⚠️⚠️⚠️ MANDATORY VALIDATION FOR EVERY SINGLE QUESTION ⚠️⚠️⚠️
        
        Before generating EACH question, you MUST check ALL of these:
        
        STEP 1: Check for forbidden words
        ❌ Does it contain: อะไร, อะไรบ้าง, ใด, ใดบ้าง, อย่างไร, ทำไม, เมื่อไหร่, ที่ไหน, ใคร, เท่าไหร่, กี่?
        → IF YES: REJECT and REWRITE
        
        STEP 2: Check question structure
        ✅ Does it make a SPECIFIC, CONCRETE statement?
        ✅ Does the statement include specific details (numbers, names, actions)?
        → IF NO: ADD specific details
        
        STEP 3: Check answerability
        ✅ Can it be answered with ONLY: ใช่, ใช่บางส่วน, or ไม่ใช่?
        ❌ Does it require explanation, description, or listing?
        → IF requires explanation: REJECT and REWRITE
        
        STEP 4: Final check
        ✅ Does it end with "ใช่หรือไม่"?
        ✅ Is the statement before "ใช่หรือไม่" complete and specific?
        
        ⚠️ IF ANY CHECK FAILS: DO NOT USE THAT QUESTION. REWRITE IT COMPLETELY.
        
        EXAMPLES OF AUTOMATIC REJECTION:
        ❌ "กฎหมายมีวัตถุประสงค์ใดเป็นหลัก ใช่หรือไม่" → Contains "ใด" (FORBIDDEN)
        ❌ "โครงการมีผลกระทบอะไรบ้าง ใช่หรือไม่" → Contains "อะไรบ้าง" (FORBIDDEN)
        ❌ "มาตรการป้องกันเป็นอย่างไร ใช่หรือไม่" → Contains "อย่างไร" (FORBIDDEN)

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
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-pro"
  ];

  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting chat with model: ${modelName}`);
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
      console.log(`Chat successful with model: ${modelName}`);
      return response.text();
    } catch (error) {
      console.warn(`Chat model ${modelName} failed:`, error.message);
      lastError = error;
      // Continue to next model
    }
  }

  // If all models fail
  console.error("All Chat AI models failed:", lastError);

  // Provide more specific error message
  if (lastError?.message?.includes('API key')) {
    throw new Error("ขออภัย API key ไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่า");
  } else if (lastError?.message?.includes('quota')) {
    throw new Error("ขออภัย ใช้งาน AI เกินโควต้าแล้ว กรุณาลองใหม่ภายหลัง");
  } else {
    throw new Error(`ขออภัย ไม่สามารถเชื่อมต่อกับ AI ได้ในขณะนี้ (${lastError?.message || 'Unknown error'})`);
  }
};

