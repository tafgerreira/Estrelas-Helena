
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject } from "../types";

/**
 * FASE 1: O LEITOR
 * Realiza OCR de alta precisão e análise de contexto pedagógico.
 */
export const readSchoolWorksheet = async (base64Images: string[]): Promise<{
  rawContent: string;
  detectedSubject: string;
  confidence: number;
  isLegible: boolean;
}> => {
  if (!process.env.API_KEY) throw new Error("API_KEY_MISSING");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const imageParts = base64Images.map(img => ({
    inlineData: { mimeType: "image/jpeg", data: img.includes(',') ? img.split(',')[1] : img }
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          ...imageParts,
          { text: `CONTEXTO: Ficha escolar do 2º ano (Portugal). 
          TAREFA: Transcreve o conteúdo principal destas imagens. 
          Identifica: 1. O tema exato (ex: verbos, somas, animais). 2. Os exercícios propostos. 
          Ignora: Sombras, mãos na foto, ou manchas. 
          Responde em JSON: {"rawContent": "resumo do que está escrito", "detectedSubject": "tema", "confidence": 0-1, "isLegible": boolean}` }
        ]
      },
      config: { 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 16000 } // Permite ao modelo "olhar" com mais atenção
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro na Fase 1 (Leitura):", error);
    throw error;
  }
};

/**
 * FASE 2: O CRIADOR
 * Converte o conteúdo bruto em desafios interativos para a Helena.
 */
export const convertContentToHelenaChallenges = async (
  contentData: { rawContent: string, detectedSubject: string },
  targetSubject: Subject
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
            complexity: { type: Type.INTEGER },
            translation: { type: Type.STRING }
          },
          required: ["type", "question", "correctAnswer", "explanation", "complexity"]
        }
      }
    },
    required: ["questions"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Com base neste conteúdo de uma ficha escolar: "${contentData.rawContent}" (Tema: ${contentData.detectedSubject}).
      Cria 5 desafios divertidos para a Helena (2º ano). 
      Se a ficha for sobre ${targetSubject}, foca nisso. 
      Usa linguagem motivadora. No tipo 'word-ordering', as 'options' devem ser as palavras da frase baralhadas.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7
      }
    });

    const result = JSON.parse(response.text || '{"questions": []}');
    return (result.questions || []).map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9)
    }));
  } catch (error) {
    console.error("Erro na Fase 2 (Conversão):", error);
    return [];
  }
};

/**
 * Função unificada que substitui as antigas e implementa o novo pipeline.
 */
export const generateQuestionsFromImages = async (
  base64Images: string[], 
  subject: Subject
): Promise<Question[]> => {
  try {
    // 1. Ler as imagens com alta precisão
    const content = await readSchoolWorksheet(base64Images);
    
    if (!content.isLegible && content.confidence < 0.3) {
      throw new Error("A imagem está demasiado difícil de ler. Tira outra foto?");
    }

    // 2. Converter em perguntas interativas
    return await convertContentToHelenaChallenges(content, subject);
  } catch (error) {
    console.error("Falha no pipeline Gemini:", error);
    throw error;
  }
};

// Mantemos por compatibilidade, mas agora usa o motor novo
export const validateWorksheetImage = async (base64Image: string): Promise<{
  isValid: boolean;
  topic?: string;
  feedback: string;
  errorType?: 'api_key' | 'connection' | 'content';
}> => {
  try {
    const result = await readSchoolWorksheet([base64Image]);
    return {
      isValid: result.isLegible,
      topic: result.detectedSubject,
      feedback: result.isLegible ? "Parece ótimo!" : "O robô está com dificuldade em ler esta página.",
      errorType: undefined
    };
  } catch (e: any) {
    return { 
      isValid: false, 
      feedback: "Erro ao validar.", 
      errorType: e.message === "API_KEY_MISSING" ? 'api_key' : 'connection' 
    };
  }
};
