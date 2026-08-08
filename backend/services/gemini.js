const { GoogleGenAI } = require('@google/genai');
const resultSchema = require('../schemas/resultSchema');

// Helper to get an array of keys
function getApiKeys() {
  const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  if (!keysString) return [];
  return keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
}

/**
 * Parses image and extracts OCR placements using Gemini
 * Automatically rotates API keys if one fails with a 429
 */
async function extractResultsFromImage(file, eventName, category) {
  const apiKeys = getApiKeys();
  
  if (apiKeys.length === 0) {
    throw new Error('No Gemini API keys configured on the server.');
  }

  // Define prompt
  const prompt = `
    You are an expert OCR AI processing a handwritten or printed score sheet for a cultural festival competition.
    The competition is: "${eventName}" (Category: "${category}").
    
    Extract the list of placed winners from the image. 
    Map their position to an integer (1 = First, 2 = Second, 3 = Third).
    Extract their Student Name and Class.
    Extract their House strictly mapping to: 'NOVA', 'VEGA', 'ORION', 'ASTRA', or 'N/A' if missing/unclear.
    Provide a confidence score ('high', 'medium', 'low') based on how legible the handwriting is.
    Do NOT attempt to assign points. Do not guess houses if they are illegible, use 'N/A' and set confidence to 'low'.
  `;

  const imagePart = {
    inlineData: {
      data: file.buffer.toString('base64'),
      mimeType: file.mimetype
    }
  };

  let lastError = null;

  // Attempt generation rotating through all available keys
  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[i];
    
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [prompt, imagePart],
        config: {
          responseMimeType: 'application/json',
          responseSchema: resultSchema,
          temperature: 0.1, // Low temperature for factual extraction
        }
      });

      const responseText = response.text;
      
      if (!responseText) {
        throw new Error('Received empty response from Gemini API.');
      }

      const parsedData = JSON.parse(responseText);
      
      // Perform strict backend validation on the shape
      if (!parsedData.results || !Array.isArray(parsedData.results)) {
         throw new Error('Gemini API returned an invalid JSON structure (missing results array).');
      }

      // Add a warning if any confidence is low
      const warnings = [];
      const hasLowConfidence = parsedData.results.some(r => r.confidence === 'low');
      if (hasLowConfidence) {
        warnings.push('One or more fields had low OCR legibility. Please verify names and houses carefully.');
      }

      return {
        results: parsedData.results,
        warnings
      };

    } catch (error) {
      console.warn(`[OCR Warning] API Key at index ${i} failed. Reason: ${error.message}`);
      lastError = error;
      
      // Check if it's a rate limit / quota issue. Usually contains "429" or "quota"
      const errorStr = String(error).toLowerCase();
      if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('too many requests')) {
        // Continue to the next key in the loop
        continue;
      }
      
      // If it's a different error (e.g. invalid JSON structure), throw immediately
      throw error;
    }
  }

  // If we exhaust the loop, all keys failed.
  throw new Error(`All available Gemini API keys failed or hit their rate limits. Last Error: ${lastError.message}`);
}

module.exports = {
  extractResultsFromImage
};
