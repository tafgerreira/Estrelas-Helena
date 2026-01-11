import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject } from "../types";

export const generateQuestionsFromImages = async (
  base64Images: string[], 
  subject: Subject
): Promise<Question[]> => {
  // Garantir que temos a chave da API do ambiente
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    console.error("API_KEY não configurada no ambiente.");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";

  const systemPrompt = `
    És um professor experiente do 1º ciclo (2º ano) em Portugal.
    Analisa as imagens da ficha de ${subject} fornecidas.
    Gera 5 novos exercícios lúdicos e educativos similares aos que estão na ficha, adequados para uma criança de 7 anos.
    
    Regras por disciplina:
    - Português: Foca em gramática (nomes próprios/comuns, verbos no presente, adjetivos), ortografia e interpretação simples.
    - Matemática: Adição/Subtração até 100, problemas do dia-a-dia e figuras geométricas.
    - Estudo do Meio: Natureza, corpo humano, sentidos, família e comunidade.
    - Inglês: Cores, números até 20, animais e saudações.
    
    Importante: A complexidade (complexity) deve ser de 1 a 5.
    - 1: Muito fácil (0.50€)
    - 3: Médio (1.50€)
    - 5: Desafio difícil (2.50€)

    Retorna APENAS um JSON válido seguindo o esquema fornecido.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['multiple-choice', 'text', 'word-ordering'] },
            question: { type: Type.STRING },
            translation: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            complexity: { type: Type.INTEGER, minimum: 1, maximum: 5 }
          },
          required: ['id', 'type', 'question', 'correctAnswer', 'complexity', 'explanation']
        }
      }
    }
  };

  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: img.includes(',') ? img.split(',')[1] : img
    }
  }));

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          ...imageParts,
          { text: "Lê esta ficha e cria 5 exercícios divertidos para eu resolver." }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("Resposta vazia da IA");
    
    const result = JSON.parse(text);
    return (result.questions || []).map((q: any) => ({
      ...q,
      id: q.id || Math.random().toString(36).substr(2, 9)
    }));
  } catch (error) {
    console.error("Erro ao gerar perguntas via Gemini:", error);
    return [];
  }
};