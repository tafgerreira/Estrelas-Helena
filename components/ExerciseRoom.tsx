import React, { useState, useEffect } from 'react';
import { Question, Subject } from '../types';
import { Star, ArrowRight, Loader2, PartyPopper, RefreshCcw, Wallet } from 'lucide-react';

interface ExerciseRoomProps {
  questions: Question[];
  subject: Subject;
  worksheetImages: string[];
  initialIndex: number;
  initialCorrectCount: number;
  initialTotalCredits: number;
  globalCredits: number;
  onProgressUpdate: (progress: any) => void;
  onComplete: (correct: number, credits: number, total: number) => void;
  onExit: () => void;
}

interface WordItem {
  id: string;
  text: string;
  isUsed: boolean;
}

const ExerciseRoom: React.FC<ExerciseRoomProps> = ({ 
  questions: propQuestions, subject, initialIndex, 
  initialCorrectCount, initialTotalCredits, globalCredits, onComplete, onExit 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  
  // Estado para Word Ordering
  const [wordPool, setWordPool] = useState<WordItem[]>([]);
  const [orderedIndices, setOrderedIndices] = useState<number[]>([]);
  
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(initialCorrectCount);
  const [totalCredits, setTotalCredits] = useState(initialTotalCredits);
  const [earnedInThisQuestion, setEarnedInThisQuestion] = useState(0);

  const currentQuestion = propQuestions[currentIndex];

  // Reinicializar estados ao mudar de pergunta
  useEffect(() => {
    if (currentQuestion) {
      setIsAnswered(false);
      setSelectedOption(null);
      setTextAnswer('');
      setEarnedInThisQuestion(0);

      if (currentQuestion.type === 'word-ordering' && currentQuestion.options) {
        // Criar o pool de palavras com IDs únicos para permitir duplicados (ex: dois "O")
        const pool = currentQuestion.options.map((text, idx) => ({
          id: `q${currentIndex}-w${idx}`,
          text: text,
          isUsed: false
        }));
        setWordPool(pool);
        setOrderedIndices([]);
      }
    }
  }, [currentIndex, currentQuestion]);

  const toggleWord = (index: number) => {
    if (isAnswered) return;

    const isCurrentlyUsed = wordPool[index].isUsed;
    
    if (isCurrentlyUsed) {
      // Se já está na frase, remover
      setOrderedIndices(prev => prev.filter(i => i !== index));
    } else {
      // Se não está, adicionar ao fim
      setOrderedIndices(prev => [...prev, index]);
    }

    // Atualizar estado visual no pool
    setWordPool(prev => {
      const newPool = [...prev];
      newPool[index] = { ...newPool[index], isUsed: !isCurrentlyUsed };
      return newPool;
    });
  };

  const resetSentence = () => {
    if (isAnswered) return;
    setOrderedIndices([]);
    setWordPool(prev => prev.map(w => ({ ...w, isUsed: false })));
  };

  const handleAnswer = () => {
    let isCorrect = false;
    const cleanCorrect = currentQuestion.correctAnswer.toLowerCase().trim().replace(/[.,!?;]$/, '');
    
    if (currentQuestion.type === 'multiple-choice') {
      isCorrect = selectedOption === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'word-ordering') {
      const constructed = orderedIndices.map(i => wordPool[i].text).join(' ').toLowerCase().trim().replace(/[.,!?;]$/, '');
      isCorrect = constructed === cleanCorrect;
    } else {
      isCorrect = textAnswer.toLowerCase().trim().replace(/[.,!?;]$/, '') === cleanCorrect;
    }

    const value = currentQuestion.complexity * 0.5;
    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setTotalCredits(t => t + value);
      setEarnedInThisQuestion(value);
    } else {
      setEarnedInThisQuestion(0);
    }
    setIsAnswered(true);
  };

  const nextQuestion = () => {
    if (currentIndex >= propQuestions.length - 1) {
      onComplete(correctCount, totalCredits, propQuestions.length);
    } else {
      setCurrentIndex(c => c + 1);
    }
  };

  if (!currentQuestion) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-12 h-12 text-blue-500" /></div>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-[40px] sm:rounded-[50px] shadow-2xl p-6 sm:p-10 border-4 border-yellow-200 relative overflow-hidden">
        
        {/* Progresso Topo */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="flex flex-col gap-1">
            <span className="bg-blue-100 text-blue-600 px-4 sm:px-6 py-1 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 border-blue-200 w-fit">
              {subject} • {currentIndex + 1} / {propQuestions.length}
            </span>
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full border border-yellow-200 w-fit">
              <Wallet size={12} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Mealheiro: {globalCredits.toFixed(2)}€</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-yellow-400 text-white px-4 py-2 rounded-full shadow-lg border-2 border-yellow-300">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span className="font-black text-lg sm:text-xl">{totalCredits.toFixed(2)}€</span>
            </div>
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest mr-2">Ganhos de Agora</span>
          </div>
        </div>

        {/* Pergunta */}
        <div className="mb-8 text-center px-2">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 leading-tight mb-3">
            {currentQuestion.question}
          </h2>
          {currentQuestion.translation && (
            <p className="text-purple-500 font-bold italic text-base sm:text-lg">"{currentQuestion.translation}"</p>
          )}
        </div>

        {/* Respostas */}
        <div className="space-y-4 mb-8">
          
          {/* Múltipla Escolha */}
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((opt, i) => (
            <button
              key={i}
              disabled={isAnswered}
              onClick={() => setSelectedOption(opt)}
              className={`w-full p-4 sm:p-6 rounded-[25px] sm:rounded-[30px] border-4 text-left font-black text-lg sm:text-xl transition-all ${
                isAnswered 
                  ? (opt === currentQuestion.correctAnswer ? 'bg-green-100 border-green-500 text-green-700 shadow-inner' : (selectedOption === opt ? 'bg-red-100 border-red-500 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-400'))
                  : (selectedOption === opt ? 'bg-blue-50 border-blue-500 text-blue-700 scale-[1.02] shadow-xl' : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50/30')
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-inherit flex items-center justify-center shrink-0 text-sm sm:text-base">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </div>
            </button>
          ))}

          {/* Escrita de Texto */}
          {currentQuestion.type === 'text' && (
            <div className="relative">
              <input
                type="text"
                value={textAnswer}
                disabled={isAnswered}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Escreve aqui a resposta..."
                className={`w-full p-6 sm:p-8 rounded-[30px] sm:rounded-[35px] border-4 text-center text-xl sm:text-2xl font-black outline-none transition-all ${
                  isAnswered 
                    ? (textAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim() ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700')
                    : 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white'
                }`}
              />
              <p className="mt-2 text-center text-xs text-gray-400 font-bold">Clica no campo para escreveres a resposta!</p>
            </div>
          )}

          {/* Ordenação de Frase */}
          {currentQuestion.type === 'word-ordering' && (
            <div className="space-y-6">
              {/* Área onde a frase é montada */}
              <div className="min-h-[140px] p-6 sm:p-8 bg-blue-50/50 rounded-[30px] border-4 border-dashed border-blue-200 flex flex-wrap gap-2 sm:gap-3 justify-center items-center shadow-inner relative">
                {orderedIndices.map((wordIdx) => (
                  <button 
                    key={`ordered-${wordIdx}`} 
                    disabled={isAnswered}
                    onClick={() => toggleWord(wordIdx)}
                    className="bg-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-md font-black text-blue-600 border-2 border-blue-200 hover:border-red-400 hover:text-red-500 transition-all transform hover:-translate-y-1 active:scale-95 text-base sm:text-xl"
                  >
                    {wordPool[wordIdx].text}
                  </button>
                ))}
                {orderedIndices.length === 0 && (
                  <span className="text-blue-300 font-bold italic text-sm sm:text-base text-center">Toca nas palavras abaixo para montares a frase aqui!</span>
                )}
                
                {orderedIndices.length > 0 && !isAnswered && (
                  <button 
                    onClick={resetSentence}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm text-gray-300 hover:text-orange-500 transition-colors"
                    title="Recomeçar"
                  >
                    <RefreshCcw className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Reserva de Palavras (Pool) */}
              <div className="flex flex-wrap gap-3 justify-center bg-gray-50 p-6 rounded-[30px] border-4 border-gray-100">
                {wordPool.map((word, idx) => (
                  <button 
                    key={`pool-${idx}`} 
                    disabled={isAnswered || word.isUsed}
                    onClick={() => toggleWord(idx)}
                    className={`px-5 sm:px-7 py-3 sm:py-4 rounded-2xl font-black text-base sm:text-xl transition-all shadow-sm border-4 ${
                      word.isUsed 
                        ? 'bg-gray-200 border-gray-300 text-gray-400 scale-90 opacity-0 pointer-events-none' 
                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:scale-105 active:scale-95 shadow-md'
                    }`}
                  >
                    {word.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feedback de Acerto/Erro */}
        {isAnswered && (
          <div className={`mb-8 p-6 sm:p-8 rounded-[30px] sm:rounded-[35px] border-4 animate-in zoom-in-95 ${earnedInThisQuestion > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-4 mb-3">
              {earnedInThisQuestion > 0 ? (
                <>
                  <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
                  <div>
                    <p className="text-green-800 font-black text-xl sm:text-2xl tracking-tight">Boa, Helena! 🎉</p>
                    <p className="text-green-600 font-bold">Ganhaste <span className="text-xl">+{earnedInThisQuestion.toFixed(2)}€</span>!</p>
                  </div>
                </>
              ) : (
                <>
                  <Star className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                  <div>
                    <p className="text-red-800 font-black text-xl sm:text-2xl tracking-tight">Quase lá!</p>
                    <p className="text-red-600 font-bold text-sm sm:text-base">A resposta certa era: <span className="underline decoration-2">{currentQuestion.correctAnswer}</span></p>
                  </div>
                </>
              )}
            </div>
            <p className="text-gray-600 font-bold italic leading-relaxed text-sm sm:text-base mt-2 border-t pt-3 border-black/5">
              💡 {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Botão de Ação */}
        <div className="flex gap-4">
          {!isAnswered ? (
            <button
              onClick={handleAnswer}
              disabled={
                (currentQuestion.type === 'multiple-choice' && !selectedOption) ||
                (currentQuestion.type === 'text' && !textAnswer.trim()) ||
                (currentQuestion.type === 'word-ordering' && orderedIndices.length === 0)
              }
              className="flex-1 bg-blue-500 text-white py-5 sm:py-6 rounded-[25px] sm:rounded-[35px] font-black text-xl sm:text-2xl shadow-xl hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-b-8 border-blue-700"
            >
              Verificar Resposta
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="flex-1 bg-green-500 text-white py-5 sm:py-6 rounded-[25px] sm:rounded-[35px] font-black text-xl sm:text-2xl shadow-xl hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-8 border-green-700"
            >
              {currentIndex >= propQuestions.length - 1 ? 'Finalizar!' : 'Próximo Desafio'} <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          )}
        </div>
      </div>
      
      <button 
        onClick={onExit} 
        className="mt-6 sm:mt-8 text-gray-400 font-bold w-full text-center hover:text-red-400 transition-colors py-2 text-sm sm:text-base"
      >
        Sair e guardar progresso
      </button>
    </div>
  );
};

export default ExerciseRoom;