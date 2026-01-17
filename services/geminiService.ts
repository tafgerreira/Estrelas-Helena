
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Question, Subject } from "../types";

export const generateQuestionsFromImages = async (
  base64Images: string[], 
  subject: Subject
): Promise<Question[]> => {
  if (!process.env.API_KEY) {
    console.error("ERRO: API_KEY não encontrada no ambiente.");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-3-flash-preview'; 

  const systemPrompt = `És um Professor de 1º Ciclo em Portugal, especialista em criar exercícios digitais para o 2º ano.
    
    OBJETIVO:
    A Helena enviou imagens da sua ficha escolar de ${subject}. Tens de transformar o que vês em 5 desafios interativos.
    
    REGRAS DE OURO PARA VISÃO:
    1. LÊ TUDO: Analisa cada imagem. Se houver várias imagens, trata-as como uma única ficha contínua.
    2. TOLERÂNCIA ZERO A FALHAS: Mesmo que a imagem esteja desfocada, com sombras ou o lápis esteja claro, NÃO DESISTAS. 
    3. SEJA CRIATIVO: Se não conseguires ler uma palavra específica, usa o contexto escolar do 2º ano (Portugal) para deduzir o que é ou inventa um exercício similar sobre o mesmo tema da ficha.
    4. FOCO NO 2º ANO: Usa linguagem adequada (ex: "Helena, ajuda o monstrinho a contar...", "Consegues encontrar o erro na frase?").

    TIPOS DE DESAFIOS QUE PODES CRIAR:
    - "multiple-choice": Perguntas com 4 opções.
    - "text": A Helena escreve a resposta (ideal para ditados ou contas).
    - "word-ordering": Ordenar palavras para formar frases corretas.

    FORMATO DE RESPOSTA (JSON PURO):
    {
      "questions": [
        {
          "type": "multiple-choice" | "text" | "word-ordering",
          "question": "Pergunta clara e carinhosa",
          "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
          "correctAnswer": "A resposta certa",
          "explanation": "Explicação pedagógica e motivadora",
          "complexity": 1-5
        }
      ]
    }`;

  // Enviamos até 10 imagens para garantir que o contexto global da ficha é capturado
  const imageParts = base64Images.slice(0, 10).map(img => {
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
          { text: `Helena enviou estas fotos. Cria 5 desafios divertidos de ${subject} para ela.` }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7, // Aumentada para permitir maior "criatividade" em caso de má visibilidade
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("A IA devolveu uma resposta vazia.");
    
    const jsonMatch = text.trim().match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : '{"questions": []}');

    if (!result.questions || result.questions.length === 0) {
      throw new Error("Nenhuma pergunta gerada no JSON.");
    }

    return result.questions.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      complexity: q.complexity || 2,
      explanation: q.explanation || "Muito bem, Helena! Continua assim!"
    }));

  } catch (error) {
    console.error("Erro crítico na geração de perguntas:", error);
    
    // Fallback: Se falhar, tentamos gerar perguntas genéricas de alta qualidade para não frustrar a criança
    try {
      const fallbackResponse = await ai.models.generateContent({
        model: modelName,
        contents: `A Helena quer treinar ${subject} (2º ano, Portugal). Cria 5 perguntas divertidas (JSON).`,
        config: { responseMimeType: "application/json" }
      });
      const fbJson = JSON.parse(fallbackResponse.text?.match(/\{[\s\S]*\}/)?.[0] || '{"questions":[]}');
      return fbJson.questions || [];
    } catch (innerError) {
      return [];
    }
  }
};
