
import React, { useState, useEffect } from 'react';
import { Subject, Question, Worksheet } from '../types';
import { Loader2, AlertCircle, ArrowLeft, Zap, Rocket, Layers, Search, Pencil, Star } from 'lucide-react';
import { generateQuestionsFromImages } from '../services/geminiService';

interface WorksheetUploaderProps {
  subject: Subject;
  savedWorksheets: Worksheet[];
  recentWorksheetIds: string[];
  onQuestionsGenerated: (questions: Question[], images: string[], worksheetId: string) => void;
  onClose: () => void;
}

const FUNNY_MESSAGES = [
  "A chamar o Robô Sabichão...",
  "O robô está a ler os teus apontamentos!",
  "A preparar desafios mágicos...",
  "Uau! Estas fichas são interessantes!",
  "A Helena vai brilhar hoje!",
  "Quase pronto para o desafio..."
];

const WorksheetUploader: React.FC<WorksheetUploaderProps> = ({ 
  subject, 
  savedWorksheets, 
  recentWorksheetIds,
  onQuestionsGenerated, 
  onClose 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const isMixed = subject === Subject.ALL;

  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % FUNNY_MESSAGES.length);
        setProcessingProgress(p => Math.min(p + 3, 98));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const processWorksheet = async (worksheet: Worksheet) => {
    setLoading(true);
    setError(null);
    setProcessingProgress(5);
    
    try {
      // Passamos todas as imagens da ficha para o robô ter contexto total
      const questions = await generateQuestionsFromImages(worksheet.images, worksheet.subject);
      
      if (questions && questions.length > 0) {
        onQuestionsGenerated(questions, worksheet.images, worksheet.id);
      } else {
        throw new Error("Não consegui criar os desafios desta vez.");
      }
    } catch (err: any) {
      setError(err.message === "API_KEY_MISSING" ? "Falta a Chave do Robô (API Key)." : "O robô está cansado. Tenta outra ficha!");
    } finally {
      setLoading(false);
    }
  };

  const startSuperChallenge = async () => {
    if (savedWorksheets.length === 0) return;
    
    setLoading(true);
    setError(null);
    setProcessingProgress(10);

    // Seleciona até 3 fichas aleatórias para o desafio global
    const selectedWorksheets = [...savedWorksheets]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    // NOVIDADE: Aggregamos TODAS as imagens das fichas selecionadas
    const allImages: string[] = [];
    selectedWorksheets.forEach(ws => {
      allImages.push(...ws.images);
    });

    // Limitamos a um máximo de 6 imagens para o prompt não ficar demasiado pesado
    const finalBatch = allImages.slice(0, 6);

    try {
      const questions = await generateQuestionsFromImages(finalBatch, Subject.ALL);
      
      if (questions && questions.length > 0) {
        onQuestionsGenerated(questions, finalBatch, 'super-' + Date.now());
      } else {
        throw new Error("Falha no Super Desafio.");
      }
    } catch (err: any) {
      setError("Houve um problema. Tenta de novo!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl p-8 border-t-8 border-blue-500 relative overflow-hidden">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-gray-500" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{isMixed ? "Super Desafio" : subject}</h2>
            <p className="text-gray-500 text-sm">Qual vamos fazer agora, Helena?</p>
          </div>
          {isMixed && savedWorksheets.length > 0 && !loading && (
            <button 
              onClick={startSuperChallenge}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Zap size={20} fill="currentColor" /> SUPER DESAFIO
            </button>
          )}
        </div>

        {!loading ? (
          <div className="space-y-6">
            {error ? (
              <div className="p-8 bg-red-50 text-red-800 rounded-[35px] border-4 border-red-100 text-center space-y-4">
                 <AlertCircle className="text-red-600 mx-auto" size={40} />
                 <h3 className="text-xl font-black">Algo correu mal...</h3>
                 <p className="text-sm font-bold opacity-70">{error}</p>
                 <button onClick={() => setError(null)} className="bg-red-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg">Tentar de novo</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                {savedWorksheets.length > 0 ? (
                  savedWorksheets.map(w => (
                    <button
                      key={w.id}
                      onClick={() => processWorksheet(w)}
                      className="w-full p-4 rounded-[30px] border-2 bg-white border-gray-100 hover:border-blue-400 hover:shadow-xl active:scale-95 transition-all flex items-center gap-4 text-left group"
                    >
                      <div className="relative w-20 h-20 shrink-0">
                        <img src={w.images[0]} className="w-full h-full rounded-[20px] object-cover border-2 border-white shadow-sm" />
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white">{w.images.length}</div>
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-lg text-gray-800">{w.name}</p>
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">{w.subject}</span>
                      </div>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Rocket size={24} />
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100">
                    <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-black">Ainda não tens fichas!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center text-center space-y-8">
            <div className="relative">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                <Search className="w-16 h-16 text-blue-600 animate-pulse" />
              </div>
              <Loader2 className="w-44 h-44 text-blue-200 animate-spin absolute -top-6 -left-6" />
            </div>
            <div className="space-y-4 px-6">
              <h3 className="text-2xl font-black text-blue-600 h-16 flex items-center justify-center">{FUNNY_MESSAGES[messageIndex]}</h3>
              <div className="w-72 h-4 bg-blue-50 rounded-full overflow-hidden mx-auto border-2 border-blue-100">
                <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${processingProgress}%` }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorksheetUploader;
