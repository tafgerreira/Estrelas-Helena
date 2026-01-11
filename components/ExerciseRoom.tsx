
import React, { useState, useEffect, useMemo } from 'react';
import { Question, Subject } from '../types';
import { Star, ArrowRight, Loader2, PartyPopper, RefreshCcw } from 'lucide-react';

interface ExerciseRoomProps {
  questions: Question[];
  subject: Subject;
  worksheetImages: string[];
  initialIndex: number;
  initialCorrectCount: number;
  initialTotalCredits: number;
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
  initialCorrectCount, initialTotalCredits, onComplete, onExit 
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

  // Inicializar o pool de palavras quando a pergunta muda
  useEffect(() => {
    if (currentQuestion?.type === 'word-ordering' && currentQuestion.options) {
      const shuffled = [...currentQuestion.options]
        .sort(() => Math.random() - 0.5)
        .map((text, idx) => ({
          id: `${currentIndex}-${idx}`,
          text: text,
          isUsed: false
        }));
      setWordPool(shuffled);
      setOrderedIndices([]);
    }
  }, [currentIndex, currentQuestion]);

  const toggleWord = (index: number) => {
    if (isAnswered) return;

    setWordPool(prev => {
      const newPool = [...prev];
      const isCurrentlyUsed = newPool[index].isUsed;
      
      if (isCurrentlyUsed) {
        // Remover da frase
        setOrderedIndices(prevIndices => prevIndices.filter(i => i !== index));
      } else {
        // Adicionar à frase
        setOrderedIndices(prevIndices => [...prevIndices, index]);
      }
      
      newPool[index].isUsed = !isCurrentlyUsed;
      return newPool;
    });
  };

  const handleAnswer = () => {
    let isCorrect = false;
    const cleanAnswer = currentQuestion.correctAnswer.toLowerCase().trim().replace(/[.,!?;]$/, '');
    
    if (currentQuestion.type === 'multiple-choice') {
      isCorrect = selectedOption === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'word-ordering') {
      const constructed = orderedIndices.map(i => wordPool[i].text).join(' ').toLowerCase().trim().replace(/[.,!?;]$/, '');
      isCorrect = constructed === cleanAnswer;
    } else {
      isCorrect = textAnswer.toLowerCase().trim().replace(/[.,!?;]$/, '') === cleanAnswer;
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
      setSelectedOption(null);
      setTextAnswer('');
      setIsAnswered(false);
      setEarnedInThisQuestion(0);
    }
  };

  if (!currentQuestion) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-12 h-12 text-blue-500" /></div>;

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-[40px] sm:rounded-[50px] shadow-2xl p-6 sm:p-10 border-4 border-yellow-200 relative overflow-hidden">
        
        {/* Progresso Topo */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <span className="bg-blue-100 text-blue-600 px-4 sm:px-6 py-2 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 border-blue-200">
            {subject} • {currentIndex + 1} / {propQuestions.length}
          </span>
          <div className="flex items-center gap-2 bg-yellow-400 text-white px-4 py-2 rounded-full shadow-lg border-2 border-yellow-300">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            <span className="font-black text-lg sm:text-xl">{totalCredits.toFixed(2)}€</span>
          </div>
        </div>

        {/* Pergunta */}
        <div className="mb-8 text-center">
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
                placeholder="Escreve aqui..."
                autoFocus
                className={`w-full p-6 sm:p-8 rounded-[30px] sm:rounded-[35px] border-4 text-center text-xl sm:text-2xl font-black outline-none transition-all ${
                  isAnswered 
                    ? (textAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim() ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700')
                    : 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white'
                }`}
              />
            </div>
          )}

          {/* Ordenação de Frase */}
          {currentQuestion.type === 'word-ordering' && (
            <div className="space-y-6">
              {/* Área de Construção (Frase) */}
              <div className="min-h-[120px] p-6 sm:p-8 bg-blue-50/50 rounded-[30px] border-4 border-dashed border-blue-200 flex flex-wrap gap-2 sm:gap-3 justify-center items-center shadow-inner">
                {orderedIndices.map((wordIdx) => (
                  <button 
                    key={`ordered-${wordIdx}`} 
                    disabled={isAnswered}
                    onClick={() => toggleWord(wordIdx)}
                    className="bg-white px-4 sm:px-5 py-2 sm:py-3 rounded-2xl shadow-md font-black text-blue-600 border-2 border-blue-200 hover:border-red-400 hover:text-red-500 transition-all transform hover:-translate-y-1 active:scale-95 text-base sm:text-lg"
                  >
                    {wordPool[wordIdx].text}
                  </button>
                ))}
                {orderedIndices.length === 0 && (
                  <span className="text-blue-300 font-bold italic text-sm sm:text-base">Toca nas palavras abaixo para formar a frase</span>
                )}
              </div>

              {/* Reserva de Palavras (Pool) */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center bg-gray-50 p-6 rounded-[30px] border-4 border-gray-100">
                {wordPool.map((word, idx) => (
                  <button 
                    key={`pool-${idx}`} 
                    disabled={isAnswered || word.isUsed}
                    onClick={() => toggleWord(idx)}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-black text-base sm:text-lg transition-all shadow-sm border-4 ${
                      word.isUsed 
                        ? 'bg-gray-100 border-gray-200 text-gray-200 scale-90 opacity-40' 
                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:scale-105 active:scale-95 shadow-md'
                    }`}
                  >
                    {word.text}
                  </button>
                ))}
                <button 
                  onClick={() => { setOrderedIndices([]); setWordPool(prev => prev.map(w => ({...w, isUsed: false}))); }}
                  disabled={isAnswered || orderedIndices.length === 0}
                  className="p-3 text-gray-400 hover:text-orange-500 disabled:opacity-0 transition-all"
                  title="Recomeçar frase"
                >
                  <RefreshCcw className="w-6 h-6" />
                </button>
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
                    <p className="text-red-600 font-bold">A resposta certa era: <span className="underline">{currentQuestion.correctAnswer}</span></p>
                  </div>
                </>
              )}
            </div>
            <p className="text-gray-600 font-bold italic leading-relaxed text-sm sm:text-base">{currentQuestion.explanation}</p>
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
              className="flex-1 bg-blue-500 text-white py-4 sm:py-6 rounded-[25px] sm:rounded-[35px] font-black text-xl sm:text-2xl shadow-xl hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verificar
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="flex-1 bg-green-500 text-white py-4 sm:py-6 rounded-[25px] sm:rounded-[35px] font-black text-xl sm:text-2xl shadow-xl hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-3"
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
        Desistir por agora e sair
      </button>
    </div>
  );
};

export default ExerciseRoom;
