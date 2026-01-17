
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
  
  // Usamos o modelo PRO para máxima precisão analítica
  const modelName = 'gemini-3-pro-preview';

  const systemPrompt = `És um professor de elite do 1º Ciclo (2º ano) em Portugal.
    A tua missão é analisar imagens de fichas escolares da Helena e criar 5 exercícios divertidos.

    INSTRUÇÕES DE LEITURA (MUITO IMPORTANTE):
    1. Se o texto estiver difícil de ler, NÃO DESISTAS. Observa o contexto visual: 
       - Se vires números e sinais (+, -, x), cria problemas de Matemática.
       - Se vires desenhos de animais ou plantas, cria perguntas de Estudo do Meio.
       - Se vires linhas de caligrafia ou textos longos, cria perguntas de Português.
    2. Usa o currículo do 2º ano de Portugal: numeração até 1000, tabuadas (2, 3, 4, 5, 10), classes das palavras (nomes, verbos, adjetivos), meio ambiente, etc.
    3. Linguagem: PT-PT, muito carinhosa e motivadora para a Helena.

    TIPOS DE QUESTÕES PERMITIDAS:
    - 'multiple-choice': Pergunta com 4 opções.
    - 'text': Pergunta de resposta aberta curta.
    - 'word-ordering': Fornece uma frase desordenada em 'options' para a Helena ordenar.

    REQUISITO TÉCNICO: Retorna APENAS um objeto JSON puro, sem markdown, com esta estrutura:
    {
      "questions": [
        {
          "type": "multiple-choice" | "text" | "word-ordering",
          "question": "texto da pergunta",
          "options": ["opção 1", "opção 2"...], // obrigatório para choice e ordering
          "correctAnswer": "resposta exata",
          "explanation": "Explicação pedagógica rápida",
          "complexity": 1-5
        }
      ]
    }`;

  const imageParts = base64Images.slice(0, 5).map(img => {
    // Garante que enviamos apenas a parte dos dados, sem o prefixo mime
    const dataOnly = img.includes(',') ? img.split(',')[1] : img;
    return {
      inlineData: { 
        mimeType: "image/jpeg", 
        data: dataOnly 
      }
    };
  });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          ...imageParts, 
          { text: `Analisa estas fichas de ${subject}. Gera 5 exercícios educativos perfeitos para o 2º ano. Se a imagem for inconclusiva, baseia-te no tema geral que conseguires detetar para criar exercícios novos.` }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text || "";
    const result = JSON.parse(responseText.replace(/```json/g, "").replace(/```/g, "").trim());
    
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error("Formato inválido");
    }

    return result.questions.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      complexity: q.complexity || 2,
      explanation: q.explanation || "Muito bem, Helena! Estás a progredir imenso!"
    }));

  } catch (error) {
    console.error("Erro ao gerar perguntas:", error);
    return [];
  }
};
