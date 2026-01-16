
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Question, Subject } from "../types";

export const generateQuestionsFromImages = async (
  base64Images: string[], 
  subject: Subject
): Promise<Question[]> => {
  // Always use process.env.API_KEY for the API key.
  if (!process.env.API_KEY) return [];

  // Use a named parameter for the API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // 'gemini-3-flash-preview' is recommended for basic vision-to-text and summarization tasks.
  const model = 'gemini-3-flash-preview';

  const systemPrompt = `És um professor experiente do 2º ano do ensino primário em Portugal. 
    Analisa as imagens de fichas escolares fornecidas e gera 5 exercícios educativos em formato JSON.
    
    IMPORTANTE:
    1. Se a disciplina for '${Subject.ALL}', mistura Português, Matemática e Estudo do Meio.
    2. Caso contrário, gera exercícios EXCLUSIVAMENTE sobre ${subject}.
    3. Cria perguntas CLARAS e DIVERTIDAS para uma criança de 7-8 anos (Helena).
    4. Sê tolerante com a qualidade da imagem: tenta extrair o máximo de informação possível. Se a imagem estiver difícil de ler, cria perguntas criativas baseadas no tema visível.

    Tipos permitidos:
    - 'multiple-choice': 4 opções curtas.
    - 'text': Resposta de uma ou duas palavras.
    - 'word-ordering': Palavras baralhadas em 'options' para formar a frase em 'correctAnswer'.

    Retorna APENAS o JSON com o campo 'questions'.`;

  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: img.includes(',') ? img.split(',')[1] : img
    }
  }));

  try {
    // Calling generateContent with the model name and contents.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: {
        parts: [...imageParts, { text: `Gera 5 exercícios de nível 2º ano sobre o tema da ficha. Foca em: ${subject}` }]
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  complexity: { type: Type.INTEGER }
                },
                required: ['type', 'question', 'correctAnswer', 'complexity', 'explanation']
              }
            }
          }
        }
      }
    });

    // Directly access the .text property of GenerateContentResponse.
    const result = JSON.parse(response.text || '{"questions": []}');
    return (result.questions || []).map((q: any) => ({
      ...q,
      id: q.id || Math.random().toString(36).substr(2, 9)
    }));
  } catch (error) {
    console.error("Erro Gemini:", error);
    return [];
  }
};
