import React, { useState, useEffect } from 'react';
import { Subject, Question, Worksheet } from '../types';
import { Loader2, AlertCircle, ArrowLeft, History, Sparkles, Brain, Wand2, Rocket, Lock, Camera } from 'lucide-react';
import { generateQuestionsFromImages } from '../services/geminiService';

interface WorksheetUploaderProps {
  subject: Subject;
  savedWorksheets: Worksheet[];
  recentWorksheetIds: string[];
  onQuestionsGenerated: (questions: Question[], images: string[], worksheetId: string) => void;
  onClose: () => void;
}

const FUNNY_MESSAGES = [
  "O robô professor está a usar os seus super-óculos para ler...",
  "A transformar papel em estrelas mágicas...",
  "Espera um pouco, os duendes da escola estão a preparar os desafios!",
  "A carregar o teu cérebro com super-poderes...",
  "O computador está a pensar... fumaça de sabedoria a sair! 💨",
  "A preparar perguntas épicas só para ti, Helena!",
  "A alinhar as estrelas do conhecimento... quase pronto!",
  "A traduzir as imagens para a língua dos génios..."
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

  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % FUNNY_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const processWorksheet = async (worksheet: Worksheet) => {
    setLoading(true);
    setError(null);
    setProcessingProgress(10);
    
    try {
      setProcessingProgress(30);
      // Passar o subject real da ficha para o Gemini saber o que ler
      const questions = await generateQuestionsFromImages(worksheet.images, worksheet.subject);
      setProcessingProgress(80);

      if (questions && questions.length > 0) {
        onQuestionsGenerated(questions, worksheet.images, worksheet.id);
      } else {
        setError("Não conseguimos processar esta ficha. Tenta tirar uma foto com mais luz ou menos tremida!");
      }
    } catch (err) {
      setError("Houve um problema na ligação. Verifica a tua internet!");
      console.error(err);
    } finally {
      setLoading(false);
      setProcessingProgress(100);
    }
  };

  const isMixed = subject === Subject.ALL;

  return (
    <div className="max-w-3xl mx-auto p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl p-8 border-t-8 border-blue-500 relative overflow-hidden">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-gray-500" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{isMixed ? "Super Desafio (Tudo)" : subject}</h2>
            <p className="text-gray-500 text-sm">
              {isMixed 
                ? "Escolhe qualquer uma das tuas fichas!" 
                : "Escolhe um dos teus desafios guardados."}
            </p>
          </div>
        </div>

        {!loading ? (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <History className="w-5 h-5 text-green-500" /> Desafios Disponíveis ({savedWorksheets.length})
            </h3>
            
            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
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
                      <div className="w-20 h-20 shrink-0 relative">
                        <img src={w.images[0]} className={`w-full h-full rounded-2xl object-cover border ${isRecent ? 'grayscale' : ''}`} />
                        {isRecent && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
                            <Lock size={24} className="text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className={`font-black text-lg ${isRecent ? 'text-gray-400' : 'text-gray-800'}`}>
                          {w.name}
                        </p>
                        <div className="flex items-center gap-2">
                           {isMixed && (
                             <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                               {w.subject}
                             </span>
                           )}
                           <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                             {w.date}
                           </p>
                        </div>
                      </div>

                      {isRecent ? (
                        <div className="text-[10px] font-black text-gray-400 uppercase text-right leading-tight">
                          Bloqueado<br/>Faz outros 2<br/>primeiro!
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                          <Rocket size={24} />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-20 px-4 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100">
                  <Wand2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-black text-xl mb-2">Ainda não tens fichas!</p>
                  <p className="text-gray-400 text-sm">Pede aos teus pais para guardarem novas fichas.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95">
            <div className="relative">
              <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
                <Brain className="w-16 h-16 text-blue-500" />
              </div>
              <Loader2 className="w-40 h-40 text-blue-500 animate-spin absolute -top-4 -left-4 opacity-20" />
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-black text-blue-600 animate-pulse">
                {FUNNY_MESSAGES[messageIndex]}
              </h3>
              <div className="max-w-xs mx-auto">
                <div className="flex justify-between text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">
                  <span>A ler a ficha</span>
                  <span>{processingProgress}%</span>
                </div>
                <div className="w-64 h-4 bg-blue-50 rounded-full overflow-hidden p-1 border-2 border-blue-100">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-700 shadow-lg" 
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-400 font-bold italic text-sm">Quase pronto para o teu desafio!</p>
          </div>
        )}

        {error && !loading && (
          <div className="mt-8 p-6 bg-red-50 text-red-700 rounded-3xl border-4 border-red-100 animate-in shake duration-500">
            <div className="flex items-center gap-4 mb-2">
               <AlertCircle className="w-8 h-8 flex-shrink-0" />
               <p className="font-black text-xl tracking-tight">Não conseguimos processar esta ficha.</p>
            </div>
            <p className="font-bold opacity-80 leading-relaxed mb-4">{error}</p>
            <div className="flex flex-col gap-2 p-3 bg-white/50 rounded-xl">
               <p className="text-xs font-black uppercase text-red-500 flex items-center gap-2">
                 <Camera size={14} /> Pede ajuda aos teus pais para:
               </p>
               <ul className="text-xs font-bold list-disc list-inside">
                 <li>Tirar a foto com mais luz</li>
                 <li>Manter a câmara parada (sem tremer)</li>
                 <li>Enquadrar bem a página inteira</li>
               </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorksheetUploader;