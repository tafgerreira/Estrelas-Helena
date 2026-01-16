import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject } from "../types";

export const generateQuestionsFromImages = async (
  base64Images: string[], 
  subject: Subject
): Promise<Question[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return [];

  // Initialize Gemini client with process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey });
  // Use gemini-3-pro-preview for complex reasoning tasks like analyzing worksheets and generating new questions
  const model = 'gemini-3-pro-preview';

  const isMixed = subject === Subject.ALL;

  const systemPrompt = `És um professor do 2º ano em Portugal. 
    Analisa as imagens e gera 5 exercícios educativos em formato JSON.
    
    ESTRITAMENTE OBRIGATÓRIO:
    ${isMixed 
      ? "Gera uma mistura equilibrada de Português, Matemática, Estudo do Meio e Inglês." 
      : `Gera exercícios EXCLUSIVAMENTE de ${subject}. É proibido incluir perguntas de outras disciplinas.`}
    
    Instruções por área:
    - Português: Gramática, ortografia ou interpretação de texto.
    - Matemática: Cálculo até 100 ou geometria básica.
    - Estudo do Meio: Natureza, corpo humano ou sociedade.
    - Inglês: Vocabulário básico (cores, animais, números).

    Regras de Formato para 'word-ordering':
    - Se usares 'word-ordering', o campo 'options' DEVE conter as palavras da frase correta de forma baralhada.
    - O campo 'correctAnswer' deve ser a frase completa e correta.

    Estrutura JSON esperada: campo 'questions' contendo lista de objetos com:
    - id (string única)
    - type ('multiple-choice', 'text', 'word-ordering')
    - question (pergunta clara)
    - options (array de strings: para multiple-choice são as escolhas; para word-ordering são as palavras baralhadas)
    - correctAnswer (string exata)
    - complexity (1 a 5)
    - explanation (uma frase explicativa pedagógica)
    
    Retorna apenas o JSON.`;

  const imageParts = base64Images.map(img => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: img.includes(',') ? img.split(',')[1] : img
    }
  }));

  try {
    // Call generateContent with model and prompt content
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [...imageParts, { text: `Gera 5 exercícios de nível 2º ano primário focados em: ${subject}` }]
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
                required: ['type', 'question', 'correctAnswer', 'complexity']
              }
            }
          }
        }
      }
    });

    // Extract text directly from response.text property
    const result = JSON.parse(response.text || '{"questions": []}');
    return (result.questions || []).map((q: any) => ({
      ...q,
      id: q.id || Math.random().toString(36).substr(2, 9)
    }));
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};
