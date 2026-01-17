
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject } from "../types";

export const validateWorksheetImage = async (base64Image: string): Promise<{
  isValid: boolean;
  topic?: string;
  feedback: string;
  errorType?: 'api_key' | 'connection' | 'content';
}> => {
  if (!process.env.API_KEY) {
    return { isValid: false, feedback: "API Key em falta", errorType: 'api_key' };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dataOnly = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: dataOnly } },
          { text: "Analisa esta imagem de uma ficha escolar do 2º ano. É legível? Responde apenas JSON: {\"isValid\": boolean, \"topic\": \"string\", \"feedback\": \"string\"}" }
        ]
      },
      config: { 
        responseMimeType: "application/json",
        temperature: 0.1
      }
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return { ...parsed, errorType: undefined };
  } catch (e: any) {
    console.error("Erro na validação Gemini:", e);
    const msg = e.message || "";
    if (msg.includes("entity was not found") || msg.includes("API key")) {
      return { isValid: false, feedback: "API Key inválida ou expirada", errorType: 'api_key' };
    }
    return { isValid: false, feedback: "Erro ao ligar ao Robô Sabichão", errorType: 'connection' };
  }
};

export const generateQuestionsFromImages = async (
  base64Images: string[], 
  subject: Subject
): Promise<Question[]> => {
  if (!process.env.API_KEY) return [];
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING, enum: ["multiple-choice", "text", "word-ordering"] },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            complexity: { type: Type.INTEGER }
          },
          required: ["type", "question", "correctAnswer", "explanation", "complexity"]
        }
      }
    },
    required: ["questions"]
  };

  const imageParts = base64Images.slice(0, 5).map(img => ({
    inlineData: { mimeType: "image/jpeg", data: img.includes(',') ? img.split(',')[1] : img }
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          ...imageParts,
          { text: `CONTEXTO: 2º ano Portugal. TEMA: ${subject}. TAREFA: Cria 5 exercícios divertidos usando o nome Helena.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7
      }
    });

    const text = response.text || '{"questions": []}';
    const result = JSON.parse(text);
    return result.questions.map((q: any) => ({ ...q, id: Math.random().toString(36).substr(2, 9) }));
  } catch (error) {
    console.error("Erro ao gerar perguntas:", error);
    return [];
  }
};
