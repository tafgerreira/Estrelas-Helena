
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
  // Modelo de última geração para melhor visão e raciocínio
  const modelName = 'gemini-3-flash-preview'; 

  const systemPrompt = `És um Professor de Apoio Escolar em Portugal para o 2º ano.
    
    A tua missão é criar 5 desafios pedagógicos para a Helena.
    
    REGRAS CRÍTICAS DE RESILIÊNCIA:
    1. Se as imagens estiverem impercetíveis, NÃO dês erro. Cria 5 exercícios genéricos de 2º ano sobre ${subject}.
    2. Usa o currículo de Portugal (PNL):
       - Português: Nomes, adjetivos, verbos, antónimos, leitura.
       - Matemática: Adição/subtração até 1000, tabuadas (2, 3, 4, 5, 10), formas.
       - Estudo do Meio: Corpo humano, plantas, animais, história local.
    3. Fala DIRETAMENTE para a Helena de forma carinhosa.
    4. Usa APENAS JSON no formato solicitado.

    FORMATO JSON:
    {
      "questions": [
        {
          "type": "multiple-choice" | "text" | "word-ordering",
          "question": "Texto da pergunta",
          "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
          "correctAnswer": "Resposta exata",
          "explanation": "Dica para a Helena",
          "complexity": 1-5
        }
      ]
    }`;

  const imageParts = base64Images.slice(0, 3).map(img => {
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
          { text: `Cria 5 exercícios para a Helena sobre ${subject}. Se não conseguires ler as fotos, ignora-as e cria exercícios fantásticos de 2º ano sobre este tema.` }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("Resposta vazia da IA");
    
    let jsonStr = text.trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const result = JSON.parse(jsonStr);
    return result.questions.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      complexity: q.complexity || 2,
      explanation: q.explanation || "Incrível, Helena! Continua assim!"
    }));

  } catch (error) {
    console.error("Erro no Gemini, a tentar fallback criativo:", error);
    
    // FALLBACK AUTOMÁTICO: Se a visão falhar, pedimos apenas texto (sem fotos)
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: modelName,
        contents: `Cria 5 perguntas de 2º ano para a disciplina de ${subject} em Portugal. Formato JSON com campo 'questions'.`,
        config: { 
          responseMimeType: "application/json",
          systemInstruction: "És um professor carinhoso. Gera sempre exercícios válidos de 2º ano." 
        }
      });
      
      const fbText = fallbackResponse.text || "{}";
      const fbResult = JSON.parse(fbText.match(/\{[\s\S]*\}/)?.[0] || "{}");
      return fbResult.questions || [];
    } catch (fallbackError) {
      return [];
    }
  }
};
