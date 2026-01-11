
import React, { useState } from 'react';
import { Question, Subject } from '../types';
import { Star, ArrowRight, Loader2, PartyPopper } from 'lucide-react';

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

const ExerciseRoom: React.FC<ExerciseRoomProps> = ({ 
  questions: propQuestions, subject, worksheetImages, initialIndex, 
  initialCorrectCount, initialTotalCredits, onProgressUpdate, onComplete, onExit 
}) => {
  const [internalQuestions] = useState(propQuestions);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [orderedWords, setOrderedWords] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(initialCorrectCount);
  const [totalCredits, setTotalCredits] = useState(initialTotalCredits);
  const [earnedInThisQuestion, setEarnedInThisQuestion] = useState(0);

  const currentQuestion = internalQuestions[currentIndex];

  const handleAnswer = () => {
    let isCorrect = false;
    const answer = currentQuestion.correctAnswer.toLowerCase().trim();
    
    if (currentQuestion.type === 'multiple-choice') {
      isCorrect = selectedOption === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'word-ordering') {
      isCorrect = orderedWords.join(' ').toLowerCase().trim() === answer;
    } else {
      isCorrect = textAnswer.toLowerCase().trim() === answer;
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
    if (currentIndex >= internalQuestions.length - 1) {
      onComplete(correctCount, totalCredits, internalQuestions.length);
    } else {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setTextAnswer('');
      setOrderedWords([]);
      setIsAnswered(false);
      setEarnedInThisQuestion(0);
    }
  };

  if (!currentQuestion) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-12 h-12 text-blue-500" /></div>;

  return (
    <div className="max-w-3xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-[50px] shadow-2xl p-10 border-4 border-yellow-200 relative overflow-hidden">
        {/* Progresso Topo */}
        <div className="flex justify-between items-center mb-8">
          <span className="bg-blue-100 text-blue-600 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest border-2 border-blue-200">
            {subject} • {currentIndex + 1} de {internalQuestions.length}
          </span>
          <div className="flex items-center gap-2 bg-yellow-400 text-white px-5 py-2 rounded-full shadow-lg border-2 border-yellow-300">
            <Star className="w-5 h-5 fill-current" />
            <span className="font-black text-xl">{totalCredits.toFixed(2)}€</span>
          </div>
        </div>

        {/* Pergunta */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-gray-800 leading-tight mb-4">
            {currentQuestion.question}
          </h2>
          {currentQuestion.translation && (
            <p className="text-purple-500 font-bold italic text-lg">"{currentQuestion.translation}"</p>
          )}
        </div>

        {/* Respostas */}
        <div className="space-y-4 mb-10">
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((opt, i) => (
            <button
              key={i}
              disabled={isAnswered}
              onClick={() => setSelectedOption(opt)}
              className={`w-full p-6 rounded-[30px] border-4 text-left font-black text-xl transition-all ${
                isAnswered 
                  ? (opt === currentQuestion.correctAnswer ? 'bg-green-100 border-green-500 text-green-700 shadow-inner' : (selectedOption === opt ? 'bg-red-100 border-red-500 text-red-700' : 'bg-gray-50 border-gray-100 text-gray-400'))
                  : (selectedOption === opt ? 'bg-blue-50 border-blue-500 text-blue-700 scale-[1.02] shadow-xl' : 'bg-gray-50 border-gray-200 hover:border-blue-300 hover:bg-blue-50/30')
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-white border-2 border-inherit flex items-center justify-center shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </div>
            </button>
          ))}

          {currentQuestion.type === 'text' && (
            <div className="relative">
              <input
                type="text"
                value={textAnswer}
                disabled={isAnswered}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Escreve aqui..."
                className={`w-full p-8 rounded-[35px] border-4 text-center text-2xl font-black outline-none transition-all ${
                  isAnswered 
                    ? (textAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim() ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700')
                    : 'bg-gray-50 border-gray-200 focus:border-blue-500 focus:bg-white'
                }`}
              />
            </div>
          )}

          {currentQuestion.type === 'word-ordering' && (
            <div className="space-y-6">
              <div className="min-h-[100px] p-8 bg-gray-50 rounded-[35px] border-4 border-dashed border-gray-200 flex flex-wrap gap-3 justify-center items-center shadow-inner">
                {orderedWords.map((w, i) => (
                  <button 
                    key={i} 
                    disabled={isAnswered}
                    onClick={() => !isAnswered && setOrderedWords(orderedWords.filter((_, idx) => idx !== i))}
                    className="bg-white px-5 py-3 rounded-2xl shadow-md font-black text-blue-600 border-2 border-blue-100 hover:border-red-200 transition-colors"
                  >
                    {w}
                  </button>
                ))}
                {orderedWords.length === 0 && <span className="text-gray-300 font-bold italic">Toca nas palavras abaixo para ordenar</span>}
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {currentQuestion.options?.filter(w => !orderedWords.includes(w)).map((w, i) => (
                  <button 
                    key={i} 
                    disabled={isAnswered}
                    onClick={() => setOrderedWords([...orderedWords, w])}
                    className="bg-white border-4 border-gray-100 px-6 py-3 rounded-2xl font-black text-gray-700 hover:border-blue-400 hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feedback de Acerto/Erro */}
        {isAnswered && (
          <div className={`mb-8 p-8 rounded-[35px] border-4 animate-in zoom-in-95 ${earnedInThisQuestion > 0 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center gap-4 mb-3">
              {earnedInThisQuestion > 0 ? (
                <>
                  <PartyPopper className="w-10 h-10 text-green-500" />
                  <div>
                    <p className="text-green-800 font-black text-2xl tracking-tight">Boa, Helena! 🎉</p>
                    <p className="text-green-600 font-bold">Ganhaste <span className="text-xl">+{earnedInThisQuestion.toFixed(2)}€</span>!</p>
                  </div>
                </>
              ) : (
                <>
                  <Star className="w-10 h-10 text-blue-500" />
                  <div>
                    <p className="text-blue-800 font-black text-2xl tracking-tight">Quase lá!</p>
                    <p className="text-blue-600 font-bold">A resposta certa era: <span className="underline">{currentQuestion.correctAnswer}</span></p>
                  </div>
                </>
              )}
            </div>
            <p className="text-gray-600 font-bold italic leading-relaxed">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Botão de Ação */}
        <div className="flex gap-4">
          {!isAnswered ? (
            <button
              onClick={handleAnswer}
              disabled={!selectedOption && !textAnswer && orderedWords.length === 0}
              className="flex-1 bg-blue-500 text-white py-6 rounded-[35px] font-black text-2xl shadow-xl hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verificar
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="flex-1 bg-green-500 text-white py-6 rounded-[35px] font-black text-2xl shadow-xl hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Próximo Desafio <ArrowRight className="w-8 h-8" />
            </button>
          )}
        </div>
      </div>
      <button 
        onClick={onExit} 
        className="mt-8 text-gray-400 font-bold w-full text-center hover:text-red-400 transition-colors py-2"
      >
        Desistir por agora e sair
      </button>
    </div>
  );
};

export default ExerciseRoom;
