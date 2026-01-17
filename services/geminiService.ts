
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Question, Subject } from "../types";

export const generateQuestionsFromImages = async (
  base64Images: string[], 
  subject: Subject
): Promise<Question[]> => {
  if (!process.env.API_KEY) {
    console.error("ERRO: API_KEY não configurada.");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-flash-preview';

  // Definição do Esquema Rigoroso (Response Schema)
  // Isto obriga o Gemini a devolver EXACTAMENTE este formato, sem texto extra.
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { 
              type: Type.STRING, 
              enum: ["multiple-choice", "text", "word-ordering"],
              description: "O tipo de exercício." 
            },
            question: { type: Type.STRING, description: "A pergunta para a Helena." },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Opções para escolha múltipla ou palavras para ordenar." 
            },
            correctAnswer: { type: Type.STRING, description: "A resposta correta exata." },
            explanation: { type: Type.STRING, description: "Explicação carinhosa e pedagógica." },
            complexity: { type: Type.INTEGER, description: "Nível de dificuldade de 1 a 5." }
          },
          required: ["type", "question", "correctAnswer", "explanation", "complexity"]
        }
      }
    },
    required: ["questions"]
  };

  const systemInstruction = `És o Professor Digital da Helena (2º ano, Portugal). 
    TENS DE transformar as imagens das fichas de ${subject} em 5 desafios.
    
    INSTRUÇÕES DE EMERGÊNCIA:
    1. Se a imagem estiver tremida ou ilegível, NÃO dês erro. Inventa 5 perguntas fantásticas de ${subject} adequadas ao 2º ano (ex: ditados, problemas matemáticos até 100, Estudo do Meio).
    2. Garante que a 'explanation' é motivadora e explica o 'porquê' da resposta.
    3. Para 'word-ordering', coloca a frase completa na 'correctAnswer' e as palavras baralhadas nas 'options'.
    4. Responde APENAS o JSON, sem conversas.`;

  const imageParts = base64Images.slice(0, 10).map(img => {
    const dataOnly = img.includes(',') ? img.split(',')[1] : img;
    return {
      inlineData: { mimeType: "image/jpeg", data: dataOnly }
    };
  });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          ...imageParts,
          { text: `Gera 5 desafios baseados nestas imagens ou no tema ${subject} para o 2º ano.` }
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema, // Força o formato correto
        temperature: 0.4, // Menos aleatoriedade para maior estabilidade
      }
    });

    const result = JSON.parse(response.text || '{"questions": []}');
    
    return (result.questions || []).map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      complexity: q.complexity || 2,
      options: q.type === 'multiple-choice' || q.type === 'word-ordering' ? (q.options || []) : undefined
    }));

  } catch (error) {
    console.error("Erro no Gemini Service:", error);
    
    // Fallback Manual se tudo falhar (Gera perguntas estáticas de alta qualidade)
    return getFallbackQuestions(subject);
  }
};

// Função de segurança absoluta: se a IA falhar totalmente, devolvemos exercícios padrão de alta qualidade
const getFallbackQuestions = (subject: Subject): Question[] => {
  const themes: Record<string, any[]> = {
    [Subject.MATH]: [
      { type: 'text', question: 'Quanto é 45 + 25?', correctAnswer: '70', explanation: '40+20=60 e 5+5=10. 60+10 dá 70!' },
      { type: 'multiple-choice', question: 'Qual é o sucessor de 99?', options: ['98', '100', '101', '90'], correctAnswer: '100', explanation: 'O sucessor é o número que vem logo a seguir!' }
    ],
    [Subject.PORTUGUESE]: [
      { type: 'word-ordering', question: 'Ordena a frase:', options: ['gosta', 'A', 'ler', 'Helena', 'de'], correctAnswer: 'A Helena gosta de ler', explanation: 'As frases começam sempre com letra maiúscula!' },
      { type: 'text', question: 'Qual é o plural de "Cão"?', correctAnswer: 'Cães', explanation: 'Palavras terminadas em -ão muitas vezes fazem o plural em -ães.' }
    ],
    'default': [
      { type: 'multiple-choice', question: 'O que devemos fazer antes de comer?', options: ['Brincar', 'Lavar as mãos', 'Correr', 'Dormir'], correctAnswer: 'Lavar as mãos', explanation: 'Higiene é muito importante para a saúde!' }
    ]
  };

  const selected = themes[subject] || themes['default'];
  return selected.map(q => ({
    ...q,
    id: 'fb-' + Math.random().toString(36).substr(2, 5),
    complexity: 2,
    explanation: q.explanation || "Muito bem!"
  })) as Question[];
};
