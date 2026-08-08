const { GoogleGenAI } = require('@google/genai');
const { resultSchema } = require('../schemas/resultSchema');

// We expect GEMINI_API_KEY to be available in process.env
const ai = new GoogleGenAI({}); 

/**
 * Extracts result from a result sheet image.
 * 
 * @param {Object} imageFile - The image file buffer and mimetype (e.g. from multer).
 * @param {string} eventName - The name of the event (e.g. "Pencil Drawing").
 * @param {string} category - The category (e.g. "CAT III").
 */
async function extractResultsFromImage(imageFile, eventName, category) {
  const model = "gemini-2.5-pro"; // Recommend 2.5 Pro for accurate OCR and structured output

  const prompt = `You are extracting results from a school arts festival result sheet.
Do not guess missing information. If a field cannot be confidently read, return null.
Extract the placement results for the following competition:
- Competition: ${eventName}
- Category: ${category}

Return valid JSON only. Never invent a student name, house, position, or point value.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageFile.buffer.toString('base64'),
                mimeType: imageFile.mimetype
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: resultSchema,
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error in extractResultsFromImage:", error);
    throw new Error("Failed to extract results using Gemini Vision");
  }
}

module.exports = {
  extractResultsFromImage
};
