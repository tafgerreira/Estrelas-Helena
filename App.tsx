
import React, { useState, useEffect } from 'react';
import { Subject, UserStats, Question, Prize, Worksheet, WonPrize, SubjectMetrics } from './types';
import { INITIAL_PRIZES } from './constants';
import Dashboard from './components/Dashboard';
import ExerciseRoom from './components/ExerciseRoom';
import Shop from './components/Shop';
import WorksheetUploader from './components/WorksheetUploader';
import Backoffice from './components/Backoffice';
import { Lock, X, AlertTriangle } from 'lucide-react';

interface SessionProgress {
  currentIndex: number;
  correctCount: number;
  totalCredits: number;
  worksheetImages?: string[]; // Mudança para array
  worksheetId?: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'exercise' | 'shop' | 'admin' | 'backoffice'>('dashboard');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  const ADMIN_PASSWORD = '1234';
  
  const initialSubjectStats: Record<Subject, SubjectMetrics> = {
    [Subject.PORTUGUESE]: { totalMinutes: 0, correctAnswers: 0, totalQuestions: 0 },
    [Subject.MATH]: { totalMinutes: 0, correctAnswers: 0, totalQuestions: 0 },
    [Subject.NSS]: { totalMinutes: 0, correctAnswers: 0, totalQuestions: 0 },
    [Subject.ENGLISH]: { totalMinutes: 0, correctAnswers: 0, totalQuestions: 0 },
  };

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('estudos_stats');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.subjectStats) parsed.subjectStats = initialSubjectStats;
      if (!parsed.recentWorksheetIds) parsed.recentWorksheetIds = [];
      if (!parsed.doubleCreditDays) parsed.doubleCreditDays = [0, 6]; 
      return parsed;
    }
    return {
      credits: 0,
      accuracy: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      dailyMinutes: 0,
      wonHistory: [],
      subjectStats: initialSubjectStats,
      recentWorksheetIds: [],
      doubleCreditDays: [0, 6]
    };
  });

  const [prizes, setPrizes] = useState<Prize[]>(() => {
    const saved = localStorage.getItem('estudos_prizes');
    return saved ? JSON.parse(saved) : INITIAL_PRIZES;
  });

  const [worksheets, setWorksheets] = useState<Worksheet[]>(() => {
    const saved = localStorage.getItem('estudos_worksheets');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentQuestions, setCurrentQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('estudos_current_questions');
    return saved ? JSON.parse(saved) : [];
  });

  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(() => {
    const saved = localStorage.getItem('estudos_session_progress');
    return saved ? JSON.parse(saved) : null;
  });

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const safeSave = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setStorageError(null);
    } catch (e) {
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        setStorageError("A memória está cheia! Peça aos seus pais para apagar fichas antigas.");
      }
    }
  };

  useEffect(() => { safeSave('estudos_stats', stats); }, [stats]);
  useEffect(() => { safeSave('estudos_prizes', prizes); }, [prizes]);
  useEffect(() => { safeSave('estudos_worksheets', worksheets); }, [worksheets]);
  useEffect(() => {
    if (currentQuestions.length > 0) safeSave('estudos_current_questions', currentQuestions);
    else localStorage.removeItem('estudos_current_questions');
  }, [currentQuestions]);
  useEffect(() => {
    if (sessionProgress) safeSave('estudos_session_progress', sessionProgress);
    else localStorage.removeItem('estudos_session_progress');
  }, [sessionProgress]);

  const handleExerciseComplete = (correct: number, earnedCredits: number, finalQuestionsCount: number) => {
    const currentSub = selectedSubject || Subject.PORTUGUESE;
    const sessionMinutes = 10;
    const today = new Date().getDay();
    const isDoubleDay = stats.doubleCreditDays.includes(today);
    const finalEarnedCredits = isDoubleDay ? earnedCredits * 2 : earnedCredits;

    setStats(prev => {
      const newTotalQuestions = prev.totalQuestions + finalQuestionsCount;
      const newCorrectAnswers = prev.correctAnswers + correct;
      const updatedSubjectStats = { ...prev.subjectStats };
      updatedSubjectStats[currentSub] = {
        totalMinutes: (updatedSubjectStats[currentSub]?.totalMinutes || 0) + sessionMinutes,
        totalQuestions: (updatedSubjectStats[currentSub]?.totalQuestions || 0) + finalQuestionsCount,
        correctAnswers: (updatedSubjectStats[currentSub]?.correctAnswers || 0) + correct,
      };

      let updatedRecentIds = [...prev.recentWorksheetIds];
      if (sessionProgress?.worksheetId) {
        updatedRecentIds = [sessionProgress.worksheetId, ...updatedRecentIds].slice(0, 2);
      }

      return {
        ...prev,
        credits: prev.credits + finalEarnedCredits,
        totalQuestions: newTotalQuestions,
        correctAnswers: newCorrectAnswers,
        accuracy: Math.round((newCorrectAnswers / newTotalQuestions) * 100),
        dailyMinutes: prev.dailyMinutes + sessionMinutes,
        subjectStats: updatedSubjectStats,
        recentWorksheetIds: updatedRecentIds
      };
    });

    setCurrentQuestions([]);
    setSessionProgress(null);
    setView('dashboard');
  };

  const handleProgressUpdate = (progress: { currentIndex: number, correctCount: number, totalCredits: number, worksheetImages: string[], questions: Question[] }) => {
    setSessionProgress({
      currentIndex: progress.currentIndex,
      correctCount: progress.correctCount,
      totalCredits: progress.totalCredits,
      worksheetImages: progress.worksheetImages,
      worksheetId: sessionProgress?.worksheetId
    });
    setCurrentQuestions(progress.questions);
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] pb-12">
      {storageError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <AlertTriangle className="w-6 h-6" />
          <p className="font-bold">{storageError}</p>
          <button onClick={() => setStorageError(null)} className="p-1 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
        </div>
      )}

      {view === 'dashboard' && <Dashboard stats={stats} prizes={prizes} onSelectSubject={(s) => { setSelectedSubject(s); setView('admin'); }} onOpenShop={() => setView('shop')} onOpenAdmin={() => setShowPasswordPrompt(true)} />}

      {view === 'exercise' && (
        <ExerciseRoom 
          questions={currentQuestions}
          subject={selectedSubject || Subject.PORTUGUESE}
          worksheetImages={sessionProgress?.worksheetImages || []}
          initialIndex={sessionProgress?.currentIndex || 0}
          initialCorrectCount={sessionProgress?.correctCount || 0}
          initialTotalCredits={sessionProgress?.totalCredits || 0}
          onProgressUpdate={handleProgressUpdate}
          onComplete={handleExerciseComplete}
          onExit={() => setView('dashboard')}
        />
      )}

      {view === 'shop' && <Shop credits={stats.credits} prizes={prizes} onBuy={(id) => {
        const p = prizes.find(pr => pr.id === id);
        if(p && stats.credits >= p.cost) {
          setStats(prev => ({ ...prev, credits: prev.credits - p.cost, wonHistory: [{...p, unlocked: true, dateWon: new Date().toLocaleDateString()}, ...prev.wonHistory] }));
          setPrizes(prev => prev.map(pr => pr.id === id ? {...pr, unlocked: true} : pr));
        }
      }} onClose={() => setView('dashboard')} />}

      {view === 'admin' && (
        <WorksheetUploader 
          subject={selectedSubject || Subject.PORTUGUESE}
          savedWorksheets={worksheets.filter(w => w.subject === selectedSubject)}
          recentWorksheetIds={stats.recentWorksheetIds}
          onQuestionsGenerated={(qs, imgs, id) => {
            setCurrentQuestions(qs);
            setSessionProgress({ currentIndex: 0, correctCount: 0, totalCredits: 0, worksheetImages: imgs, worksheetId: id });
            setView('exercise');
          }}
          onClose={() => setView('dashboard')}
        />
      )}

      {view === 'backoffice' && <Backoffice prizes={prizes} worksheets={worksheets} wonHistory={stats.wonHistory} subjectStats={stats.subjectStats} doubleCreditDays={stats.doubleCreditDays} onUpdateDoubleCreditDays={(d) => setStats(prev => ({...prev, doubleCreditDays: d}))} onUpdatePrizes={setPrizes} onUpdateWorksheets={setWorksheets} onClose={() => setView('dashboard')} />}

      {showPasswordPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95">
            <h2 className="text-2xl font-bold mb-4">Modo Pais</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if(passwordInput === ADMIN_PASSWORD) { setView('backoffice'); setShowPasswordPrompt(false); setPasswordInput(''); setPasswordError(false); }
              else setPasswordError(true);
            }}>
              <input type="password" autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className={`w-full p-4 border-2 rounded-xl mb-4 text-center text-xl font-bold tracking-widest ${passwordError ? 'border-red-500 bg-red-50' : 'border-gray-100'}`} placeholder="SENHA" />
              <button type="submit" className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold">Entrar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
