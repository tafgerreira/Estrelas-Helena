
import React, { useState, useEffect } from 'react';
import { Subject, Question, Worksheet } from '../types';
import { Loader2, AlertCircle, ArrowLeft, History, Sparkles, Brain, Wand2, Rocket, Zap, RefreshCw, Layers, Image as ImageIcon, Search, Pencil } from 'lucide-react';
import { generateQuestionsFromImages } from '../services/geminiService';

interface WorksheetUploaderProps {
  subject: Subject;
  savedWorksheets: Worksheet[];
  recentWorksheetIds: string[];
  onQuestionsGenerated: (questions: Question[], images: string[], worksheetId: string) => void;
  onClose: () => void;
}

const FUNNY_MESSAGES = [
  "A limpar as lentes do robô...",
  "O robô está a ler muito depressa!",
  "A preparar desafios mágicos...",
  "Estás quase a começar, Helena!",
  "A encontrar as estrelas escondidas...",
  "A carregar super-poderes..."
];

const WorksheetUploader: React.FC<WorksheetUploaderProps> = ({ 
  subject, 
  savedWorksheets, 
  recentWorksheetIds,
  onQuestionsGenerated, 
  onClose 
}) => {
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'reading' | 'generating' | 'idle'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const isMixed = subject === Subject.ALL;

  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % FUNNY_MESSAGES.length);
        setProcessingProgress(p => Math.min(p + (phase === 'reading' ? 1 : 2), 98));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading, phase]);

  const processWorksheet = async (worksheet: Worksheet) => {
    setLoading(true);
    setPhase('reading');
    setError(null);
    setProcessingProgress(5);
    
    try {
      // Fase 1 e 2 acontecem dentro desta chamada unificada agora
      // Mas vamos simular a mudança de fase para feedback visual
      setTimeout(() => setPhase('generating'), 4000);

      const questions = await generateQuestionsFromImages(worksheet.images, worksheet.subject);
      
      if (questions && questions.length > 0) {
        onQuestionsGenerated(questions, worksheet.images, worksheet.id);
      } else {
        throw new Error("O robô leu a ficha mas não conseguiu inventar perguntas. Tenta outra vez?");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message === "API_KEY_MISSING" ? "Falta a Chave do Robô (API Key). Pede aos teus pais!" : (err.message || "O robô baralhou-se. Tenta outra ficha ou tira uma foto mais clara!"));
    } finally {
      setLoading(false);
      setPhase('idle');
    }
  };

  const startSuperChallenge = async () => {
    if (savedWorksheets.length === 0) return;
    
    setLoading(true);
    setPhase('reading');
    setError(null);
    setProcessingProgress(5);

    const selectedWorksheets = [...savedWorksheets]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    const combinedImages: string[] = [];
    selectedWorksheets.forEach(ws => {
      combinedImages.push(...ws.images);
    });

    const finalBatch = combinedImages.slice(0, 8);

    try {
      setProcessingProgress(20);
      setTimeout(() => setPhase('generating'), 5000);
      
      const questions = await generateQuestionsFromImages(finalBatch, Subject.ALL);
      
      if (questions && questions.length > 0) {
        onQuestionsGenerated(questions, finalBatch, 'super-' + Date.now());
      } else {
        throw new Error("O Super Desafio falhou. Escolhe outras fichas!");
      }
    } catch (err: any) {
      setError("Houve um problema no Super Desafio. Tenta de novo!");
    } finally {
      setLoading(false);
      setPhase('idle');
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
            <h2 className="text-2xl font-bold text-gray-800">{isMixed ? "Super Desafio Global" : subject}</h2>
            <p className="text-gray-500 text-sm">Pronta para brilhar, Helena?</p>
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
                 <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="text-red-600" size={40} />
                 </div>
                 <h3 className="text-xl font-black">Oops! O Robô baralhou-se.</h3>
                 <p className="text-sm font-bold opacity-70">{error}</p>
                 <div className="flex flex-col gap-2 pt-4">
                    <button 
                      onClick={() => setError(null)} 
                      className="bg-red-500 text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-red-600 transition-all uppercase tracking-widest text-xs"
                    >
                      Tentar Outra Vez
                    </button>
                    <button 
                      onClick={onClose}
                      className="text-gray-400 font-bold text-xs p-2"
                    >
                      Voltar
                    </button>
                 </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-500" /> Escolhe uma ficha:
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 gap-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {savedWorksheets.length > 0 ? (
                    savedWorksheets.map(w => {
                      const isRecent = recentWorksheetIds?.includes(w.id);
                      return (
                        <button
                          key={w.id}
                          disabled={loading}
                          onClick={() => processWorksheet(w)}
                          className={`w-full p-4 rounded-[30px] border-2 transition-all flex items-center gap-4 text-left group relative ${
                            isRecent 
                              ? 'bg-blue-50/30 border-blue-100' 
                              : 'bg-white border-gray-100 hover:border-blue-400 hover:shadow-xl active:scale-95'
                          }`}
                        >
                          <div className="relative w-20 h-20 shrink-0">
                            <img src={w.images[0]} className={`w-full h-full rounded-[20px] object-cover border-2 border-white shadow-sm`} />
                            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                              {w.images.length}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-lg leading-tight text-gray-800">{w.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">{w.subject}</span>
                              <span className="text-[10px] font-bold text-gray-400 italic">{w.date}</span>
                            </div>
                          </div>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm bg-blue-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white`}>
                            <Rocket size={24} />
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100">
                      <Wand2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-black text-xl mb-2">Ainda não tens fichas!</p>
                      <p className="text-xs text-gray-400 px-10">Pede aos teus pais para tirarem fotografias às tuas fichas da escola.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center text-center space-y-8">
            <div className="relative">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                {phase === 'reading' ? (
                  <Search className="w-16 h-16 text-blue-600 animate-pulse" />
                ) : (
                  <Pencil className="w-16 h-16 text-purple-600 animate-bounce" />
                )}
              </div>
              <Loader2 className="w-44 h-44 text-blue-200 animate-spin absolute -top-6 -left-6" />
            </div>
            <div className="space-y-4 px-6">
              <div className="inline-block px-4 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                {phase === 'reading' ? "Fase 1: A ler a ficha..." : "Fase 2: A criar os desafios..."}
              </div>
              <h3 className="text-2xl font-black text-blue-600 h-16 flex items-center justify-center">
                {FUNNY_MESSAGES[messageIndex]}
              </h3>
              <div className="w-72 h-4 bg-blue-50 rounded-full overflow-hidden mx-auto border-2 border-blue-100">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${phase === 'reading' ? 'bg-blue-400' : 'bg-purple-500'}`} 
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                {phase === 'reading' ? "O robô está a usar o 'Thinking Mode' para ver melhor." : "Quase pronto para o jogo!"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorksheetUploader;
