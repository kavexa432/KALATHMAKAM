const { GoogleGenAI } = require('@google/genai');
const { resultSchema } = require('../schemas/resultSchema');

function getApiKeys() {
  const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  if (!keysString) return [];
  return keysString.split(',').map(k => k.trim()).filter(k => k.length > 0);
}

// Models tried in order — falls back if one hits quota or is unavailable
const MODELS_TO_TRY = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
];

async function extractResultsFromImage(file, eventName, category) {
  const apiKeys = getApiKeys();

  if (apiKeys.length === 0) {
    throw new Error('No Gemini API keys configured on the server.');
  }

  const prompt = `
    You are an expert OCR AI processing a handwritten or printed score sheet for a cultural festival competition.
    The competition is: "${eventName}" (Category: "${category}").
    
    Extract the list of placed winners from the image. 
    Map their position to an integer (1 = First, 2 = Second, 3 = Third).
    Extract their Student Name and Class.
    Extract their House strictly mapping to: 'NOVA', 'VEGA', 'ORION', 'ASTRA', or 'N/A' if missing/unclear.
    Provide a confidence score ('high', 'medium', 'low') based on how legible the handwriting is.
    Do NOT attempt to assign points. Do not guess houses if they are illegible, use 'N/A' and set confidence to 'low'.
    Return ONLY valid JSON matching the schema. No markdown, no explanation.
  `;

  const imagePart = {
    inlineData: {
      data: file.buffer.toString('base64'),
      mimeType: file.mimetype,
    },
  };

  let lastError = null;

  // Try every key × every model combination
  for (const key of apiKeys) {
    for (const model of MODELS_TO_TRY) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });

        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }, imagePart],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: resultSchema,
            temperature: 0.1,
          },
        });

        const responseText = response.text;
        if (!responseText) throw new Error('Empty response from Gemini API.');

        // Strip markdown fences if present
        const cleaned = responseText
          .replace(/^```json\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        const parsedData = JSON.parse(cleaned);

        if (!parsedData.results || !Array.isArray(parsedData.results)) {
          throw new Error('Gemini returned invalid JSON structure (missing results array).');
        }

        const warnings = [];
        if (parsedData.results.some((r) => r.confidence === 'low')) {
          warnings.push('One or more fields had low OCR legibility. Please verify names and houses carefully.');
        }

        console.log(`[OCR] Success with key index ${apiKeys.indexOf(key)}, model: ${model}`);
        return {
          results: parsedData.results,
          warnings: parsedData.warnings || warnings,
        };

      } catch (error) {
        lastError = error;
        const msg = String(error).toLowerCase();
        const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted') || msg.includes('too many requests');
        const isUnavailable = msg.includes('not found') || msg.includes('no longer available') || msg.includes('not_found');

        console.warn(`[OCR] key[${apiKeys.indexOf(key)}] model[${model}] failed: ${error.message?.substring(0, 120)}`);

        if (isQuota || isUnavailable) {
          // Try next model / key
          continue;
        }

        // Non-quota error (e.g. bad schema, auth) — throw immediately
        throw error;
      }
    }
  }

  throw new Error(`All Gemini API keys and models failed. Last error: ${lastError?.message}`);
}

module.exports = { extractResultsFromImage };
