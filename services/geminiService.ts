
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Question, Subject } from "../types";

// Função para validar se a imagem é legível ANTES de guardar a ficha
export const validateWorksheetImage = async (base64Image: string): Promise<{
  isValid: boolean;
  topic?: string;
  feedback: string;
}> => {
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
        temperature: 0.1
      }
    });

    const text = response.text || '{}';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e: any) {
    if (e.message?.includes("entity was not found")) {
      return { isValid: false, feedback: "Acesso à API expirado. Por favor, reinicie." };
    }
    return { isValid: false, feedback: "O robô não conseguiu ler bem a foto. Tenta tirar com mais luz!" };
  }
};

export const generateQuestionsFromImages = async (
  base64Images: string[], 
  subject: Subject
): Promise<Question[]> => {
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

  const subjectFocus = subject === Subject.ALL ? "vários temas (Matemática, Português, Estudo do Meio)" : subject;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          ...imageParts,
          { text: `CONTEXTO: Aluna do 2º ano (7-8 anos) em Portugal. TEMA: ${subjectFocus}.
          TAREFA: Analisa as imagens e cria 5 exercícios NOVOS e DIVERTIDOS.
          ESTILO: Usa o nome da Helena às vezes. Sê muito carinhoso.
          REGRAS: Para 'word-ordering', em 'options' coloca as palavras misturadas.` }
        ]
      },
      config: {
        systemInstruction: "És o melhor professor primário do mundo. Devolves sempre JSON.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7
      }
    });

    const text = response.text || '{"questions": []}';
    const result = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    
    if (!result.questions || result.questions.length === 0) {
      return getFallbackQuestions(subject);
    }

    return result.questions.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      complexity: q.complexity || 2
    }));
  } catch (error) {
    console.error("Erro Gemini:", error);
    return getFallbackQuestions(subject);
  }
};

const getFallbackQuestions = (subject: Subject): Question[] => {
  const themes: Record<string, any[]> = {
    [Subject.MATH]: [
      { type: 'text', question: 'Quanto é 20 + 30?', correctAnswer: '50', explanation: '2 dezenas + 3 dezenas = 5 dezenas!', complexity: 1 },
      { type: 'multiple-choice', question: 'Qual o dobro de 10?', options: ['20', '30', '40'], correctAnswer: '20', explanation: 'Dobro é 10 + 10.', complexity: 1 }
    ],
    [Subject.PORTUGUESE]: [
      { type: 'text', question: 'Qual é o contrário de "Grande"?', correctAnswer: 'Pequeno', explanation: 'O oposto de algo muito grande é algo muito pequeno!', complexity: 1 }
    ],
    'default': [
      { type: 'multiple-choice', question: 'Como se chama a nossa app?', options: ['Estrelas do Conhecimento', 'Escola Feliz', 'Robô Sabichão'], correctAnswer: 'Estrelas do Conhecimento', explanation: 'Exatamente!', complexity: 1 }
    ]
  };
  const selected = themes[subject] || themes['default'];
  return selected.map(q => ({ ...q, id: 'fb-' + Math.random().toString(36).substr(2, 5) }));
};
