const { GoogleGenAI } = require('@google/genai');

// Real Gemini model names that support multimodal (vision) input.
// gemini-2.0-flash is the primary — fast, cheap, supports images.
// gemini-1.5-flash is the stable fallback.
// NO responseSchema is used — it requires v1 API and causes 404 on v1beta.
const DEFAULT_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite',
];

function getApiKeys() {
  const keysString = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
  if (!keysString) return [];
  return keysString.split(',').map((k) => k.trim()).filter(Boolean);
}

function getModelsToTry() {
  const env = process.env.GEMINI_OCR_MODELS || process.env.GEMINI_MODEL;
  if (!env) return DEFAULT_MODELS;
  return env.split(',').map((m) => m.trim()).filter(Boolean);
}

function extractResponseText(response) {
  if (typeof response?.text === 'string') return response.text;
  if (typeof response?.text === 'function') return response.text();
  const parts = response?.candidates?.[0]?.content?.parts || [];
  return parts.map((p) => p.text || '').join('\n').trim();
}

function parseJsonResponse(text) {
  // Strip markdown code fences if present
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract the first JSON object from the string
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('Response was not valid JSON: ' + cleaned.substring(0, 200));
  }
}

function normalizeResults(parsedData) {
  const raw = Array.isArray(parsedData?.results) ? parsedData.results : [];
  return raw
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
    .filter((r) => [1, 2, 3].includes(r.position) && r.studentName);
}

async function extractResultsFromImage(file, eventName, category) {
  const apiKeys = getApiKeys();
  const models = getModelsToTry();

  if (apiKeys.length === 0) {
    throw new Error('No Gemini API key configured. Set GEMINI_API_KEY in environment variables.');
  }

  const prompt = `You are an OCR system reading a handwritten result sheet from a school cultural festival.

Competition: "${eventName}" | Category: "${category}"

Look at the image carefully and extract the placed winners (1st, 2nd, 3rd positions).

For each winner, extract:
- position: integer (1, 2, or 3)
- studentName: full name as written
- studentClass: class/grade (e.g. "IX B", "X A")
- house: one of NOVA, VEGA, ORION, ASTRA — or "N/A" if not visible
- confidence: "high" if clearly readable, "medium" if somewhat readable, "low" if hard to read

Return ONLY a JSON object in this exact format, nothing else:
{
  "results": [
    {"position": 1, "studentName": "Name Here", "studentClass": "IX B", "house": "NOVA", "confidence": "high"},
    {"position": 2, "studentName": "Name Here", "studentClass": "X A", "house": "VEGA", "confidence": "medium"},
    {"position": 3, "studentName": "Name Here", "studentClass": "IX A", "house": "ASTRA", "confidence": "low"}
  ],
  "warnings": []
}`;

  const imagePart = {
    inlineData: {
      data: file.buffer.toString('base64'),
      mimeType: file.mimetype,
    },
  };

  let lastError = null;

  for (const key of apiKeys) {
    for (const model of models) {
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
          // No responseSchema — causes 404 on v1beta endpoint.
          // We instruct JSON format via the prompt instead.
          config: {
            temperature: 0.1,
          },
        });

        const responseText = extractResponseText(response);
        if (!responseText) throw new Error('Empty response from Gemini.');

        const parsed = parseJsonResponse(responseText);
        const results = normalizeResults(parsed);

        if (results.length === 0) {
          throw new Error('No valid placed winners found in the image. Make sure positions 1, 2, 3 are visible.');
        }

        const warnings = parsed.warnings || [];
        if (results.some((r) => r.confidence === 'low')) {
          warnings.push('Some entries had low legibility — please verify carefully.');
        }

        console.log(`[OCR] ✓ key[${apiKeys.indexOf(key)}] model[${model}] → ${results.length} results`);
        return { results, warnings, modelUsed: model };

      } catch (error) {
        lastError = error;
        const msg = String(error?.message || error).toLowerCase();

        const isRetryable =
          msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted') ||
          msg.includes('not found') || msg.includes('not_found') || msg.includes('404') ||
          msg.includes('unsupported') || msg.includes('not supported') ||
          msg.includes('500') || msg.includes('503') || msg.includes('unavailable') ||
          msg.includes('timeout') || msg.includes('deadline');

        console.warn(`[OCR] ✗ key[${apiKeys.indexOf(key)}] model[${model}]: ${String(error?.message || error).substring(0, 200)}`);

        if (isRetryable) continue;

        // Non-retryable (e.g. bad API key, invalid request) — stop immediately
        throw error;
      }
    }
  }

  throw new Error(
    `OCR failed — all models tried: ${models.join(', ')}. Last error: ${lastError?.message}`
  );
}

module.exports = { extractResultsFromImage, getApiKeys, getModelsToTry };
