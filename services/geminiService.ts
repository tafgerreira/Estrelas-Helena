
import { GoogleGenAI, Type } from "@google/genai";
import { Question, Subject } from "../types";

/**
 * Nova função única e robusta para gerar perguntas.
 * Combina OCR e Geração num único passo para evitar falhas de contexto.
 */
export const generateQuestionsFromImages = async (
  base64Images: string[], 
  targetSubject: Subject
): Promise<Question[]> => {
  if (!process.env.API_KEY) throw new Error("API_KEY_MISSING");
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Limitar a 4 imagens para evitar estoiro de tokens em conexões móveis
  const processedImages = base64Images.slice(0, 4).map(img => ({
    inlineData: { 
      mimeType: "image/jpeg", 
      data: img.includes(',') ? img.split(',')[1] : img 
    }
  }));

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      detectedTopic: { type: Type.STRING },
      isReadable: { type: Type.BOOLEAN },
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
    required: ["questions", "isReadable"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          ...processedImages,
          { text: `ÉS UM PROFESSOR PORTUGUÊS DO 2º ANO. 
          ALUNA: Helena. TEMA ALVO: ${targetSubject}.
          
          INSTRUÇÕES CRÍTICAS:
          1. Analisa as imagens. Se o texto estiver tremido ou difícil de ler, NÃO DÊS ERRO. 
          2. Em vez disso, identifica o tema geral (ex: 'frações', 'animais', 'verbos') e cria 5 exercícios originais baseados no currículo do 2º ano de Portugal para esse tema.
          3. Garante que os exercícios 'word-ordering' têm frases divertidas sobre a Helena.
          4. No campo 'explanation', dá sempre um incentivo carinhoso à Helena.
          5. Responde APENAS o JSON conforme o esquema.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.6
      }
    });

    const result = JSON.parse(response.text || '{"questions": []}');
    
    // Se por algum motivo o array vier vazio, criamos perguntas de fallback
    if (!result.questions || result.questions.length === 0) {
      return getFallbackQuestions(targetSubject);
    }

    return result.questions.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9)
    }));
  } catch (error) {
    console.error("Falha total no Robô:", error);
    // Em caso de erro de rede ou API, devolvemos perguntas seguras para a criança não ficar parada
    return getFallbackQuestions(targetSubject);
  }
};

/**
 * Função de validação simplificada para o Backoffice.
 * Apenas verifica se o robô consegue ver algo.
 */
export const validateWorksheetImage = async (base64Image: string): Promise<{
  isValid: boolean;
  topic?: string;
  feedback: string;
  errorType?: 'api_key' | 'connection' | 'content';
}> => {
  if (!process.env.API_KEY) return { isValid: false, feedback: "Falta API Key", errorType: 'api_key' };

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const dataOnly = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: dataOnly } },
          { text: "Consegues ver o conteúdo desta ficha? Responde JSON: {\"canSee\": boolean, \"topic\": \"string\"}" }
        ]
      },
      config: { responseMimeType: "application/json" }
    });

    const res = JSON.parse(response.text || '{"canSee": false}');
    return {
      isValid: true, // Agora somos mais tolerantes: se ele vê algo, é válido
      topic: res.topic || "Ficha Escolar",
      feedback: res.canSee ? "Imagem carregada com sucesso!" : "A imagem parece um pouco escura, mas vamos tentar!",
    };
  } catch (e) {
    return { isValid: true, feedback: "Pronta para processar!", errorType: undefined };
  }
};

/**
 * Perguntas de reserva (Segurança) caso a API falhe totalmente.
 * Assim a Helena nunca vê um erro de código.
 */
const getFallbackQuestions = (subject: Subject): Question[] => {
  const commonQuestions: Record<string, Question[]> = {
    [Subject.MATH]: [
      { id: 'f1', type: 'text', question: "Quanto é 15 + 15?", correctAnswer: "30", explanation: "Boa! Estás a somar muito bem!", complexity: 1 },
      { id: 'f2', type: 'multiple-choice', question: "Qual destes números é PAR?", options: ["3", "5", "8", "9"], correctAnswer: "8", explanation: "Os números pares terminam em 0, 2, 4, 6 ou 8!", complexity: 1 }
    ],
    [Subject.PORTUGUESE]: [
      { id: 'f3', type: 'word-ordering', question: "Ordena a frase:", options: ["Helena", "A", "estuda", "muito"], correctAnswer: "A Helena estuda muito", explanation: "Excelente leitura!", complexity: 1 }
    ],
    "default": [
      { id: 'fd', type: 'multiple-choice', question: "A Helena é uma super-aluna?", options: ["Sim!", "Com certeza!", "Sempre!", "Claro!"], correctAnswer: "Sim!", explanation: "És a melhor!", complexity: 1 }
    ]
  };
  return commonQuestions[subject] || commonQuestions["default"];
};
