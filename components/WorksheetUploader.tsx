
import React, { useState } from 'react';
import { Subject, Question, Worksheet } from '../types';
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft, History, Lock, Layers } from 'lucide-react';
import { generateQuestionsFromImages } from '../services/geminiService';

interface WorksheetUploaderProps {
  subject: Subject;
  savedWorksheets: Worksheet[];
  recentWorksheetIds: string[];
  onQuestionsGenerated: (questions: Question[], images: string[], worksheetId: string) => void;
  onClose: () => void;
}

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

  const processWorksheet = async (worksheet: Worksheet) => {
    setLoading(true);
    setError(null);
    setProcessingProgress(10);
    
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
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-t-8 border-blue-500">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="text-gray-500" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{subject}</h2>
            <p className="text-gray-500 text-sm">Escolhe um dos desafios guardados pelos teus pais.</p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <History className="w-5 h-5 text-green-500" /> Desafios Disponíveis ({savedWorksheets.length})
          </h3>
          
          <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
            {savedWorksheets.length > 0 ? (
              savedWorksheets.map(w => {
                const isRecent = recentWorksheetIds.includes(w.id);
                
                return (
                  <button
                    key={w.id}
                    disabled={loading || isRecent}
                    onClick={() => processWorksheet(w)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 text-left group relative ${
                      isRecent 
                        ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' 
                        : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-lg'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 relative">
                        <img src={w.images[0]} className={`w-full h-full rounded-xl object-cover border ${isRecent ? 'grayscale' : ''}`} />
                        {w.images.length > 1 && (
                          <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-md">
                            {w.images.length} pág.
                          </div>
                        )}
                      </div>
                      {isRecent && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                          <Lock className="text-white w-6 h-6" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${isRecent ? 'text-gray-400' : 'text-gray-800'}`}>
                        {w.name}
                      </p>
                      {isRecent ? (
                        <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
                          Faz outras fichas primeiro!
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400">{w.date} • {w.images.length} página(s)</p>
                      )}
                    </div>

                    {!isRecent && !loading && (
                      <Layers className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6" />
                    )}
                    
                    {loading && (
                      <div className="absolute right-4">
                        <Loader2 className="animate-spin text-blue-500" />
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="text-center py-16 px-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-medium italic mb-2">Ainda não tens fichas!</p>
                <p className="text-gray-400 text-sm text-center">Pede aos teus pais para importar novas fichas no Painel de Controle.</p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-8 flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mt-6">
            <div className="flex justify-between text-xs font-bold text-blue-500 mb-1 uppercase tracking-wider">
              <span>A analisar {savedWorksheets.find(w => w.images.length > 0)?.images.length || ''} página(s)...</span>
              <span>{processingProgress}%</span>
            </div>
            <div className="w-full h-3 bg-blue-50 rounded-full overflow-hidden">
              <div className={`h-full bg-blue-500 transition-all duration-500`} style={{ width: `${processingProgress}%` }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorksheetUploader;
