
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Question, Subject } from "../types";

// Função para validar se a imagem é legível ANTES de guardar a ficha
export const validateWorksheetImage = async (base64Image: string): Promise<{
  isValid: boolean;
  topic?: string;
  feedback: string;
}> => {
  if (!process.env.API_KEY) return { isValid: false, feedback: "API Key em falta" };
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const dataOnly = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: dataOnly } },
          { text: "Analisa esta imagem de uma ficha escolar do 2º ano em Portugal. Identifica se o texto é legível o suficiente para criar exercícios. Responde APENAS em JSON: {\"isValid\": boolean, \"topic\": string, \"feedback\": string}. Se não conseguires ler nada, isValid deve ser false." }
        ]
      },
      config: { 
        responseMimeType: "application/json",
        temperature: 0.1 // Precisão máxima para validação
      }
    });

    const text = response.text || '{}';
    // Limpeza de possíveis markdown tags
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    return { isValid: false, feedback: "Erro técnico na análise da imagem." };
  }
};

export const generateQuestionsFromImages = async (
  base64Images: string[], 
  subject: Subject
): Promise<Question[]> => {
  if (!process.env.API_KEY) return getFallbackQuestions(subject);

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

  const imageParts = base64Images.slice(0, 10).map(img => ({
    inlineData: { mimeType: "image/jpeg", data: img.includes(',') ? img.split(',')[1] : img }
  }));

  const subjectFocus = subject === Subject.ALL ? "vários temas (Matemática, Português, Estudo do Meio)" : subject;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          ...imageParts,
          { text: `CONTEXTO: Aluna do 2º ano (7-8 anos) em Portugal. TEMA: ${subjectFocus}.
          TAREFA: Analisa as imagens. Se conseguires ler os exercícios originais, adapta-os. 
          SE AS IMAGENS ESTIVEREM DIFÍCEIS DE LER: Não desistas. Usa o tema visual ou palavras soltas que detetares para criar 5 exercícios NOVOS e ORIGINAIS adequados ao programa do 2º ano.
          ESTILO: Divertido, carinhoso, pedagógico.
          REGRAS: 
          1. Para 'word-ordering', as 'options' devem conter as palavras individuais da frase e 'correctAnswer' a frase completa.
          2. NUNCA respondas com lista vazia. Se falhares a leitura, inventa exercícios excelentes de ${subjectFocus}.` }
        ]
      },
      config: {
        systemInstruction: "És um professor primário brilhante. Devolves sempre JSON estruturado conforme o esquema.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7 // Um pouco de criatividade ajuda a evitar falhas de leitura
      }
    });

    const text = response.text || '{"questions": []}';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanJson);
    
    if (!result.questions || result.questions.length === 0) {
      return getFallbackQuestions(subject);
    }

    return result.questions.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      complexity: q.complexity || 2
    }));
  } catch (error) {
    console.error("Erro na geração de perguntas:", error);
    return getFallbackQuestions(subject);
  }
};

const getFallbackQuestions = (subject: Subject): Question[] => {
  const themes: Record<string, any[]> = {
    [Subject.MATH]: [
      { type: 'text', question: 'Quanto é 20 + 20 + 10?', correctAnswer: '50', explanation: '2 dezenas + 2 dezenas + 1 dezena dá 5 dezenas (50)!', complexity: 2 },
      { type: 'multiple-choice', question: 'Qual é o dobro de 5?', options: ['10', '15', '20', '5'], correctAnswer: '10', explanation: 'O dobro é multiplicar por 2. 5 + 5 = 10.', complexity: 1 }
    ],
    [Subject.PORTUGUESE]: [
      { type: 'word-ordering', question: 'Ordena a frase:', options: ['gosta', 'A', 'Helena', 'brincar', 'de'], correctAnswer: 'A Helena gosta de brincar', explanation: 'A frase começa com o nome da Helena!', complexity: 2 },
      { type: 'text', question: 'Como se escreve o plural de "Flor"?', correctAnswer: 'Flores', explanation: 'Palavras que terminam em -r, juntamos -es no plural.', complexity: 2 }
    ],
    'default': [
      { type: 'multiple-choice', question: 'Como devemos estar na sala de aula?', options: ['A gritar', 'Atentos e em silêncio', 'A dormir', 'A correr'], correctAnswer: 'Atentos e em silêncio', explanation: 'Estar atento ajuda-nos a aprender coisas fantásticas!', complexity: 1 }
    ]
  };
  const selected = themes[subject] || themes['default'];
  return selected.map(q => ({ ...q, id: 'fb-' + Math.random().toString(36).substr(2, 5) }));
};
