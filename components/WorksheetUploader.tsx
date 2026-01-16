import React, { useState, useEffect } from 'react';
import { Subject, Question, Worksheet } from '../types';
// Added Lock to the imports from lucide-react to prevent collision with the global Lock interface
import { Loader2, AlertCircle, ArrowLeft, History, Sparkles, Brain, Wand2, Rocket, Lock } from 'lucide-react';
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

  // Ciclo de mensagens divertidas
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
    setMessageIndex(Math.floor(Math.random() * FUNNY_MESSAGES.length));
    
    try {
      setProcessingProgress(30);
      const questions = await generateQuestionsFromImages(worksheet.images, subject);
      setProcessingProgress(80);

      if (questions && questions.length > 0) {
        onQuestionsGenerated(questions, worksheet.images, worksheet.id);
      } else {
        setError("Não conseguimos processar esta ficha. Pede ajuda aos teus pais!");
      }
    } catch (err) {
      setError("Ocorreu um erro ao carregar o desafio. Verifica a tua internet.");
      console.error(err);
    } finally {
      setLoading(false);
      setProcessingProgress(100);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl p-8 border-t-8 border-blue-500 relative overflow-hidden">
        {loading && (
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={120} className="text-blue-500 animate-pulse" />
          </div>
        )}

        <div className="flex items-center gap-4 mb-8">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-gray-500" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{subject === Subject.ALL ? "Mistura de Desafios" : subject}</h2>
            <p className="text-gray-500 text-sm">
              {subject === Subject.ALL 
                ? "Escolhe qualquer ficha para uma surpresa!" 
                : "Escolhe um dos teus desafios guardados."}
            </p>
          </div>
        </div>

        {!loading ? (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <History className="w-5 h-5 text-green-500" /> Os teus desafios ({savedWorksheets.length})
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
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                            <Lock size={20} className="text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <p className={`font-black text-lg ${isRecent ? 'text-gray-400' : 'text-gray-800'}`}>
                          {w.name}
                        </p>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                          {subject === Subject.ALL && <span className="text-blue-500 mr-2">[{w.subject}]</span>}
                          {w.date}
                        </p>
                      </div>

                      {!isRecent && (
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <Rocket size={20} />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-20 px-4 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100">
                  <Wand2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-black text-xl mb-2">Ainda não tens fichas!</p>
                  <p className="text-gray-400 text-sm">Pede aos teus pais para guardarem novas fichas aqui.</p>
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
                  <span>A criar magia</span>
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
            
            <p className="text-gray-400 font-bold italic text-sm">Quase pronto para o teu desafio, Helena!</p>
          </div>
        )}

        {error && !loading && (
          <div className="mt-8 flex items-center gap-3 p-6 bg-red-50 text-red-700 rounded-3xl border-2 border-red-100">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorksheetUploader;