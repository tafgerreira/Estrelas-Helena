
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
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
  // Usamos o gemini-3-flash-preview pela sua velocidade e excelente capacidade de visão
  const modelName = 'gemini-3-flash-preview'; 

  const systemPrompt = `És um Professor de Apoio Escolar em Portugal especialista em 2º ano.
    
    A tua tarefa é TRANSVERTER a ficha de exercícios da imagem em 5 desafios digitais para a Helena.
    
    INSTRUÇÕES DE VISÃO:
    1. Analisa cuidadosamente o texto manuscrito ou impresso.
    2. Ignora sombras ou má qualidade; foca-te nos contornos das letras e números.
    3. Se vires contas de somar/subtrair, replica-as. Se vires textos, cria perguntas de compreensão.
    4. Mesmo que a imagem esteja difícil, NÃO digas que não consegues ler. Usa o contexto para deduzir o que lá está e cria exercícios baseados no currículo do 2º ano de Portugal sobre ${subject}.
    
    ESTILO PEDAGÓGICO:
    - Linguagem carinhosa para a Helena.
    - Conteúdo: Português (gramática/leitura), Matemática (até 1000/tabuadas), Estudo do Meio.
    - Fala diretamente para ela: "Olha Helena, este desafio é sobre..."

    FORMATO DE RESPOSTA (APENAS JSON):
    {
      "questions": [
        {
          "type": "multiple-choice" | "text" | "word-ordering",
          "question": "Texto da pergunta",
          "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
          "correctAnswer": "Resposta exata",
          "explanation": "Dica carinhosa explicando o porquê",
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
          { text: `Helena enviou estas fotos da sua ficha de ${subject}. Transcreve e cria 5 exercícios divertidos seguindo o currículo escolar de Portugal.` }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.4, // Menor temperatura para ser mais fiel ao que está escrito
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("IA não devolveu texto");
    
    const jsonMatch = text.trim().match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");

    return (result.questions || []).map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      complexity: q.complexity || 2,
      explanation: q.explanation || "Muito bem, Helena! Estás a brilhar!"
    }));

  } catch (error) {
    console.error("Erro no Gemini Vision:", error);
    // Fallback silencioso: gera perguntas genéricas do 2º ano se a visão falhar totalmente
    const fallbackResponse = await ai.models.generateContent({
      model: modelName,
      contents: `Cria 5 exercícios de 2º ano (Portugal) sobre ${subject} para a Helena. Devolve JSON.`,
      config: { responseMimeType: "application/json" }
    });
    const fbJson = JSON.parse(fallbackResponse.text?.match(/\{[\s\S]*\}/)?.[0] || '{"questions":[]}');
    return fbJson.questions || [];
  }
};
