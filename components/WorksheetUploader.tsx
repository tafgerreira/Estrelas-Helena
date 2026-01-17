
import React, { useState, useEffect } from 'react';
import { Subject, Question, Worksheet } from '../types';
import { Loader2, AlertCircle, ArrowLeft, History, Sparkles, Brain, Wand2, Rocket, Lock, Camera, WifiOff, Zap, Lightbulb } from 'lucide-react';
import { generateQuestionsFromImages } from '../services/geminiService';

interface WorksheetUploaderProps {
  subject: Subject;
  savedWorksheets: Worksheet[];
  recentWorksheetIds: string[];
  onQuestionsGenerated: (questions: Question[], images: string[], worksheetId: string) => void;
  onClose: () => void;
}

const FUNNY_MESSAGES = [
  "O robô está a usar óculos novos...",
  "A decifrar os teus super desenhos...",
  "Quase a terminar de ler tudo...",
  "A preparar perguntas mágicas para ti!",
  "A Helena vai adorar estes desafios...",
  "Só mais um segundo, o cérebro do robô está a brilhar!"
];

const WorksheetUploader: React.FC<WorksheetUploaderProps> = ({ 
  subject, 
  savedWorksheets, 
  recentWorksheetIds,
  onQuestionsGenerated, 
  onClose 
}) => {
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState<'vision' | 'network' | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  const isMixed = subject === Subject.ALL;

  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % FUNNY_MESSAGES.length);
        setProcessingProgress(p => Math.min(p + 5, 95));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const processWorksheet = async (worksheet: Worksheet) => {
    setLoading(true);
    setErrorType(null);
    setProcessingProgress(10);
    
    try {
      const questions = await generateQuestionsFromImages(worksheet.images, worksheet.subject);
      
      if (questions && questions.length > 0) {
        onQuestionsGenerated(questions, worksheet.images, worksheet.id);
      } else {
        setErrorType('vision');
      }
    } catch (err) {
      setErrorType('network');
    } finally {
      setLoading(false);
      setProcessingProgress(100);
    }
  };

  const startSuperChallenge = async () => {
    if (savedWorksheets.length === 0) return;
    
    setLoading(true);
    setErrorType(null);
    setProcessingProgress(10);

    const shuffled = [...savedWorksheets].sort(() => 0.5 - Math.random());
    const selectedImages: string[] = [];
    
    shuffled.slice(0, 3).forEach(ws => {
      if (ws.images.length > 0) selectedImages.push(ws.images[0]);
    });

    try {
      const questions = await generateQuestionsFromImages(selectedImages, Subject.ALL);
      if (questions && questions.length > 0) {
        onQuestionsGenerated(questions, selectedImages, 'super-challenge-' + Date.now());
      } else {
        setErrorType('vision');
      }
    } catch (err) {
      setErrorType('network');
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
            <h2 className="text-2xl font-bold text-gray-800">{isMixed ? "Super Desafio Global" : subject}</h2>
            <p className="text-gray-500 text-sm">Pronta para começar?</p>
          </div>
          {isMixed && savedWorksheets.length > 0 && !loading && (
            <button 
              onClick={startSuperChallenge}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 animate-pulse"
            >
              <Zap size={20} fill="currentColor" /> COMEÇAR!
            </button>
          )}
        </div>

        {!loading ? (
          <div className="space-y-6">
            {errorType && (
              <div className="p-6 bg-red-50 text-red-800 rounded-3xl border-4 border-red-100 animate-in shake">
                <div className="flex items-start gap-4 mb-4">
                   <AlertCircle className="text-red-600 shrink-0" size={32} />
                   <div>
                     <p className="font-black text-lg">Houve um pequeno problema!</p>
                     <p className="text-sm font-bold opacity-80">A internet ou o robô tiveram uma falha. Tenta carregar na ficha outra vez!</p>
                   </div>
                </div>
                <button onClick={() => setErrorType(null)} className="w-full bg-red-500 text-white py-3 rounded-2xl font-black shadow-lg uppercase tracking-widest text-xs">Tentar Novamente</button>
              </div>
            )}

            {!errorType && (
              <>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <History className="w-5 h-5 text-green-500" /> Escolhe a tua ficha:
                </h3>
                
                <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  {savedWorksheets.length > 0 ? (
                    savedWorksheets.map(w => {
                      const isRecent = recentWorksheetIds?.includes(w.id);
                      return (
                        <button
                          key={w.id}
                          disabled={loading || isRecent}
                          onClick={() => processWorksheet(w)}
                          className={`w-full p-4 rounded-3xl border-2 transition-all flex items-center gap-4 text-left group relative ${
                            isRecent 
                              ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' 
                              : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-lg active:scale-95'
                          }`}
                        >
                          <div className="w-16 h-16 shrink-0">
                            <img src={w.images[0]} className={`w-full h-full rounded-2xl object-cover border ${isRecent ? 'grayscale' : ''}`} />
                          </div>
                          <div className="flex-1">
                            <p className={`font-black text-base ${isRecent ? 'text-gray-400' : 'text-gray-800'}`}>{w.name}</p>
                            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{w.subject}</span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <Rocket size={20} />
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100">
                      <Wand2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-black text-xl mb-2">Ainda não tens fichas!</p>
                      <p className="text-xs text-gray-400">Pede aos teus pais para adicionarem uma no Modo Pais.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center text-center space-y-8">
            <div className="relative">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
                <Brain className="w-16 h-16 text-blue-500" />
              </div>
              <Loader2 className="w-40 h-40 text-blue-500 animate-spin absolute -top-4 -left-4 opacity-20" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-blue-600 animate-pulse px-4">
                {FUNNY_MESSAGES[messageIndex]}
              </h3>
              <div className="w-64 h-3 bg-blue-50 rounded-full overflow-hidden mx-auto border border-blue-100">
                <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${processingProgress}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">A ler as tuas estrelas...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorksheetUploader;
