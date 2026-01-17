
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
    // Para validação rápida, o Flash é ideal
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: dataOnly } },
          { text: "És um assistente de professores. Analisa esta imagem de uma ficha escolar do 2º ano. É legível o suficiente para extrair exercícios? Responde apenas em formato JSON: {\"isValid\": boolean, \"topic\": \"string\", \"feedback\": \"string\"}. Se for ilegível, explica porquê no feedback (ex: muito escuro, tremido)." }
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
  
  // Usamos o Pro para a geração de perguntas pois exige OCR de alta precisão e raciocínio pedagógico
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

  const imageParts = base64Images.slice(0, 5).map(img => ({
    inlineData: { mimeType: "image/jpeg", data: img.includes(',') ? img.split(',')[1] : img }
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          ...imageParts,
          { text: `AGE COMO: Professor do 1º Ciclo em Portugal (2º ano). 
          TAREFA: Analisa as imagens fornecidas (fichas escolares) e cria 5 exercícios digitais interativos baseados no conteúdo detetado.
          CONTEXTO: A aluna chama-se Helena. Os exercícios devem ser divertidos e motivadores.
          
          DIRETRIZES DE OCR E QUALIDADE:
          1. Ignora sombras, dobras de papel ou manchas. Foca no texto e imagens pedagógicas.
          2. Se o texto estiver manuscrito, faz o teu melhor para transcrever corretamente.
          3. Se o tema for ${subject}, foca nos conceitos curriculares dessa área em Portugal.
          
          TIPOS DE EXERCÍCIOS:
          - multiple-choice: Pergunta com 4 opções.
          - text: Pergunta de resposta aberta curta.
          - word-ordering: Frase para ordenar (coloca as palavras baralhadas em 'options').
          
          Explica sempre o 'porquê' da resposta correta na 'explanation' de forma carinhosa para a Helena.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4, // Menor temperatura para ser mais fiel ao conteúdo da ficha
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text || '{"questions": []}';
    const result = JSON.parse(text);
    
    // Garantir que todas as perguntas têm ID e limpeza básica
    return (result.questions || []).map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      complexity: q.complexity || 2
    }));
  } catch (error) {
    console.error("Erro crítico ao gerar perguntas com Gemini Pro:", error);
    // Fallback silencioso ou retornar vazio para o UI lidar
    return [];
  }
};
