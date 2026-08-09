const { GoogleGenAI } = require('@google/genai');
const { resultSchema } = require('../schemas/resultSchema');

const DEFAULT_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

function getApiKeys() {
  const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  if (!keysString) return [];
  return keysString.split(',').map((key) => key.trim()).filter(Boolean);
}

function getModelsToTry() {
  const configuredModels = process.env.GEMINI_OCR_MODELS || process.env.GEMINI_MODEL;
  if (!configuredModels) return DEFAULT_MODELS;
  return configuredModels.split(',').map((model) => model.trim()).filter(Boolean);
}

function extractResponseText(response) {
  if (typeof response?.text === 'string') return response.text;
  if (typeof response?.text === 'function') return response.text();

  const parts = response?.candidates?.[0]?.content?.parts || [];
  return parts.map((part) => part.text || '').join('\n').trim();
}

function parseJsonResponse(responseText) {
  const cleaned = responseText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('Gemini returned text that was not valid JSON.');
  }
}

function normalizeExtractedResults(parsedData) {
  const results = Array.isArray(parsedData?.results) ? parsedData.results : [];

  return results
    .map((item) => ({
      position: Number(item.position),
      studentName: String(item.studentName || item.name || '').trim(),
      studentClass: String(item.studentClass || item.class || item.grade || '').trim(),
      house: String(item.house || item.houseId || 'N/A').trim().toUpperCase(),
      confidence: ['high', 'medium', 'low'].includes(String(item.confidence).toLowerCase())
        ? String(item.confidence).toLowerCase()
        : 'medium',
      studentNameConfidence: Number(item.studentNameConfidence) || undefined,
      houseConfidence: Number(item.houseConfidence) || undefined,
      positionConfidence: Number(item.positionConfidence) || undefined,
      classConfidence: Number(item.classConfidence) || undefined,
    }))
    .filter((item) => [1, 2, 3].includes(item.position) && item.studentName);
}

async function extractResultsFromImage(file, eventName, category) {
  const apiKeys = getApiKeys();
  const modelsToTry = getModelsToTry();

  if (apiKeys.length === 0) {
    throw new Error('No Gemini API keys configured on the server.');
  }

  const prompt = `
    You are an expert OCR AI processing a handwritten or printed score sheet for a cultural festival competition.
    The competition is: "${eventName}" (Category: "${category}").

    Extract the list of placed winners from the image or PDF.
    Map their position to an integer (1 = First, 2 = Second, 3 = Third).
    Extract their Student Name and Class.
    Extract their House strictly mapping to: 'NOVA', 'VEGA', 'ORION', 'ASTRA', or 'N/A' if missing/unclear.
    Provide a confidence score ('high', 'medium', 'low') based on how legible the handwriting is.
    Do NOT assign points. Do not guess houses if they are illegible, use 'N/A' and set confidence to 'low'.
    Return ONLY valid JSON matching the schema. No markdown, no explanation.
  `;

  const documentPart = {
    inlineData: {
      data: file.buffer.toString('base64'),
      mimeType: file.mimetype,
    },
  };

  let lastError = null;

  for (const key of apiKeys) {
    for (const model of modelsToTry) {
      try {
        const ai = new GoogleGenAI({ apiKey: key });

        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }, documentPart],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            responseSchema: resultSchema,
            temperature: 0.1,
          },
        });

        const responseText = extractResponseText(response);
        if (!responseText) throw new Error('Empty response from Gemini API.');

        const parsedData = parseJsonResponse(responseText);
        const normalizedResults = normalizeExtractedResults(parsedData);

        if (normalizedResults.length === 0) {
          throw new Error('Gemini did not return any readable placed winners.');
        }

        const warnings = [];
        if (normalizedResults.some((result) => result.confidence === 'low')) {
          warnings.push('One or more fields had low OCR legibility. Please verify names and houses carefully.');
        }

        console.log(`[OCR] Success with key index ${apiKeys.indexOf(key)}, model: ${model}`);
        return {
          results: normalizedResults,
          warnings: parsedData.warnings || warnings,
          modelUsed: model,
        };
      } catch (error) {
        lastError = error;
        const msg = String(error?.message || error).toLowerCase();
        const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted') || msg.includes('too many requests');
        const isUnavailable = msg.includes('not found') || msg.includes('no longer available') || msg.includes('not_found') || msg.includes('404') || msg.includes('unsupported') || msg.includes('not supported');
        const isRetryable = msg.includes('500') || msg.includes('503') || msg.includes('unavailable') || msg.includes('deadline') || msg.includes('timeout');

        console.warn(`[OCR] key[${apiKeys.indexOf(key)}] model[${model}] failed: ${error.message?.substring(0, 160)}`);

        if (isQuota || isUnavailable || isRetryable) {
          continue;
        }

        throw error;
      }
    }
  }

  throw new Error(`All Gemini OCR models failed (${modelsToTry.join(', ')}). Last error: ${lastError?.message}`);
}

module.exports = { extractResultsFromImage, getApiKeys, getModelsToTry };
