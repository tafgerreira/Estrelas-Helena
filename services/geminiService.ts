
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Question, Subject } from "../types";

export const generateQuestionsFromImages = async (
  base64Images: string[], 
  subject: Subject
): Promise<Question[]> => {
  // Verificação de segurança da API Key
  if (!process.env.API_KEY) {
    console.error("ERRO: API_KEY não configurada no ambiente.");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Usamos o modelo PRO para melhor reconhecimento de imagem e caligrafia
  const model = 'gemini-3-pro-preview';

  const systemPrompt = `És um professor experiente do 1º ciclo em Portugal (2º ano). 
    Analisa as imagens de fichas escolares fornecidas e gera EXATAMENTE 5 exercícios educativos em formato JSON.
    
    INSTRUÇÕES CRÍTICAS:
    1. Disciplina: ${subject === Subject.ALL ? 'Português, Matemática e Estudo do Meio' : subject}.
    2. Linguagem: Português de Portugal (PT-PT), divertida e adequada para uma criança de 7-8 anos.
    3. Resiliência: Se a imagem estiver tremida ou escura, identifica o tema principal e CRIA exercícios novos e criativos sobre esse tema. NÃO dês erro se não conseguires ler perfeitamente.
    4. Formato: Deves retornar APENAS o JSON puro, sem explicações fora do bloco.

    TIPOS DE PERGUNTA:
    - 'multiple-choice': 4 opções.
    - 'text': Resposta curta (1-3 palavras).
    - 'word-ordering': Palavras baralhadas para formar uma frase.

    ESQUEMA JSON:
    {
      "questions": [
        {
          "type": "multiple-choice" | "text" | "word-ordering",
          "question": "texto da pergunta",
          "options": ["opção 1", "opção 2"...], // obrigatório para multiple-choice e word-ordering
          "correctAnswer": "resposta exata",
          "explanation": "Dica pedagógica simples para a criança",
          "complexity": 1-5
        }
      ]
    }`;

  const imageParts = base64Images.map(img => {
    // Garante que o mimeType está correto e remove o prefixo data:
    const mimeType = img.match(/data:([^;]+);/)?.[1] || "image/jpeg";
    const data = img.includes(',') ? img.split(',')[1] : img;
    return {
      inlineData: { mimeType, data }
    };
  });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          ...imageParts, 
          { text: `Gera 5 exercícios de nível 2º ano baseados nestas imagens para a disciplina: ${subject}.` }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7, // Um pouco de criatividade ajuda a lidar com imagens difíceis
        responseMimeType: "application/json",
      }
    });

    let responseText = response.text || "";
    
    // Limpeza de possíveis blocos de markdown ```json ... ```
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    const result = JSON.parse(responseText);
    
    if (!result.questions || !Array.isArray(result.questions)) {
      console.error("Resposta da AI não contém lista de perguntas:", result);
      return [];
    }

    return result.questions.map((q: any) => ({
      ...q,
      id: q.id || Math.random().toString(36).substr(2, 9),
      complexity: q.complexity || 2,
      explanation: q.explanation || "Continua a tentar, estás a ir bem!"
    }));

  } catch (error) {
    console.error("Erro Crítico no Gemini Service:", error);
    return [];
  }
};
