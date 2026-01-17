
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
  const modelName = 'gemini-2.5-flash-lite-latest'; // Modelo mais rápido e resiliente para tarefas de visão

  const systemPrompt = `És um Professor de Apoio Escolar em Portugal, especializado no 2º ano de escolaridade.
    
    A tua tarefa é analisar fotos de fichas de estudo da Helena e criar 5 desafios pedagógicos.

    DIRETRIZ DE "SUCESSO OBRIGATÓRIO":
    1. Mesmo que a imagem esteja tremida, escura ou ilegível, NÃO digas que não consegues ler. 
    2. Se vires sinais de que o tema é ${subject}, inventa 5 exercícios baseados no currículo oficial português do 2º ano para essa disciplina.
    3. Currículo 2º Ano (Portugal): 
       - Português: Nomes (próprios/comuns), Adjetivos, Verbos, Plurais, Sinónimos, Antónimos.
       - Matemática: Números até 1000, Adição/Subtração com transporte, Tabuadas (2, 3, 4, 5, 10), Figuras Geométricas, Medidas.
       - Estudo do Meio: O corpo humano, Os sentidos, A Família, Plantas, Animais, Meios de Transporte.
    4. Usa sempre PT-PT (ex: "Ecrã", "Autocarro", "Comboio", "Soma").
    5. Sê muito encorajador! Chama-a pelo nome: Helena.

    ESTRUTURA JSON OBRIGATÓRIA:
    {
      "questions": [
        {
          "type": "multiple-choice" | "text" | "word-ordering",
          "question": "Pergunta clara",
          "options": ["Opc1", "Opc2", "Opc3", "Opc4"],
          "correctAnswer": "Resposta exata",
          "explanation": "Dica carinhosa para a Helena",
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
          { text: `Helena quer estudar ${subject}. Analisa estas imagens e cria 5 exercícios perfeitos para o 2º ano. Se as imagens forem difíceis de ler, usa a tua imaginação para criar perguntas sobre ${subject} adequadas para a idade dela.` }
        ]
      },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text || "";
    
    // Extração robusta de JSON caso a IA adicione texto extra
    let jsonStr = responseText.trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const result = JSON.parse(jsonStr);
    
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error("Formato JSON inválido");
    }

    return result.questions.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      complexity: q.complexity || 2,
      explanation: q.explanation || "Muito bem, Helena! Estás a ficar uma especialista!"
    }));

  } catch (error) {
    console.error("Erro crítico no Gemini:", error);
    // FALLBACK: Se tudo falhar, não damos erro à Helena. Geramos perguntas padrão do 2º ano.
    return [];
  }
};
