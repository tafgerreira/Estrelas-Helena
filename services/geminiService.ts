
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
  
  // Usamos o modelo PRO para máxima precisão em caligrafia e imagens escolares
  const modelName = 'gemini-3-pro-preview';

  const systemPrompt = `És um professor experiente do 2º ano de escolaridade em Portugal. 
    Analisa as imagens de fichas escolares fornecidas e gera EXATAMENTE 5 exercícios educativos.
    
    REGRAS DE OURO:
    1. Disciplina: ${subject === Subject.ALL ? 'Misto (Português, Matemática e Estudo do Meio)' : subject}.
    2. Linguagem: Português de Portugal (PT-PT) amigável para uma criança de 7-8 anos.
    3. Resiliência: Se a imagem estiver tremida, identifica o tema e inventa perguntas pedagógicas sobre esse tema. NÃO retornes erro por má qualidade de imagem.
    4. Tipos de Questão:
       - 'multiple-choice': 4 opções claras.
       - 'text': Resposta curta.
       - 'word-ordering': Ordenar palavras para formar uma frase correta.

    DEVES RETORNAR APENAS UM OBJETO JSON COM ESTA ESTRUTURA:
    {
      "questions": [
        {
          "type": "multiple-choice" | "text" | "word-ordering",
          "question": "texto da pergunta",
          "options": ["opção 1", "opção 2"...], // obrigatório para choice e ordering
          "correctAnswer": "resposta exata",
          "explanation": "Dica pedagógica curta e encorajadora",
          "complexity": 1-5
        }
      ]
    }`;

  const imageParts = base64Images.slice(0, 10).map(img => {
    const mimeType = img.match(/data:([^;]+);/)?.[1] || "image/jpeg";
    const data = img.includes(',') ? img.split(',')[1] : img;
    return {
      inlineData: { mimeType, data }
    };
  });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          ...imageParts, 
          { text: `Gera 5 exercícios de nível 2º ano. Disciplina: ${subject}. Se for Misto, garante que há pelo menos 1 de cada área (PT, MAT, ESTUDO).` }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        responseMimeType: "application/json",
      }
    });

    let responseText = response.text || "";
    
    // Limpeza profunda de resíduos de markdown
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

    const result = JSON.parse(responseText);
    
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error("Formato de perguntas inválido");
    }

    return result.questions.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      complexity: q.complexity || 2,
      explanation: q.explanation || "Muito bem! Continua a brilhar!"
    }));

  } catch (error) {
    console.error("Erro no Gemini Service:", error);
    // Retornamos uma lista vazia para que a UI mostre o erro amigável ao utilizador
    return [];
  }
};
