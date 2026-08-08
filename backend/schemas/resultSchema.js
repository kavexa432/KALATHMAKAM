const { Type } = require('@google/genai');

const resultSchema = {
  type: Type.OBJECT,
  properties: {
    results: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          position: { 
            type: Type.INTEGER, 
            description: "Placement position: 1 for 1st place, 2 for 2nd place, 3 for 3rd place." 
          },
          studentName: { 
            type: Type.STRING, 
            description: "Full name of the student as written on the sheet." 
          },
          studentClass: { 
            type: Type.STRING, 
            description: "Class or grade of the student (e.g. IX, X, XI)." 
          },
          house: { 
            type: Type.STRING, 
            description: "House name (must be one of: VEGA, NOVA, ASTRA, ORION). If unreadable, return null." 
          },
          confidence: { 
            type: Type.STRING, 
            description: "'high', 'medium', or 'low' based on legibility of handwriting." 
          },
        },
        required: ["position", "studentName", "studentClass", "house", "confidence"],
      }
    },
    warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Any warnings or issues encountered while reading the document, e.g. 'Second-place house was difficult to read' or 'Handwriting for 3rd place name is illegible'."
    }
  },
  required: ["results", "warnings"],
};

module.exports = { resultSchema };
