
import React, { useState, useEffect, useCallback } from 'react';
import { Subject, UserStats, Question, Prize, Worksheet, WonPrize, SubjectMetrics, Avatar } from './types';
import { INITIAL_PRIZES } from './constants';
import Dashboard from './components/Dashboard';
import ExerciseRoom from './components/ExerciseRoom';
import Shop from './components/Shop';
import AvatarShop from './components/AvatarShop';
import WorksheetUploader from './components/WorksheetUploader';
import Backoffice from './components/Backoffice';
import { Lock, X, AlertTriangle, Cloud, RefreshCw, WifiOff } from 'lucide-react';
import { supabase, saveToCloud, loadFromCloud, isSupabaseConfigured } from './services/supabaseService';

interface SessionProgress {
  currentIndex: number;
  correctCount: number;
  totalCredits: number;
  worksheetImages?: string[];
  worksheetId?: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'exercise' | 'shop' | 'avatars' | 'admin' | 'backoffice'>('dashboard');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'offline' | 'syncing' | 'online' | 'error'>('offline');

  const ADMIN_PASSWORD = '167356';
  
  const initialSubjectStats: Record<Subject, SubjectMetrics> = {
    [Subject.PORTUGUESE]: { totalMinutes: 0, correctAnswers: 0, totalQuestions: 0 },
    [Subject.MATH]: { totalMinutes: 0, correctAnswers: 0, totalQuestions: 0 },
    [Subject.NSS]: { totalMinutes: 0, correctAnswers: 0, totalQuestions: 0 },
    [Subject.ENGLISH]: { totalMinutes: 0, correctAnswers: 0, totalQuestions: 0 },
    [Subject.ALL]: { totalMinutes: 0, correctAnswers: 0, totalQuestions: 0 },
  };

  const defaultStats: UserStats = {
    credits: 0,
    points: 0, 
    accuracy: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    dailyMinutes: 0,
    wonHistory: [],
    subjectStats: initialSubjectStats,
    recentWorksheetIds: [],
    doubleCreditDays: [0, 6],
    selectedAvatarUrl: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Helena&backgroundColor=ffd5dc',
    unlockedAvatarIds: ['av-1', 'av-2', 'av-3', 'av-4', 'av-5', 'av-6']
  };

  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [prizes, setPrizes] = useState<Prize[]>(INITIAL_PRIZES);
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const initData = async () => {
    loadFromLocalStorage();
    if (!isSupabaseConfigured) {
      setCloudStatus('offline');
      return;
    }

    setCloudStatus('syncing');
    try {
      const cloudData = await loadFromCloud();
      if (cloudData) {
        setStats(prev => ({ ...defaultStats, ...cloudData.stats }));
        setPrizes(cloudData.prizes || INITIAL_PRIZES);
        setWorksheets(cloudData.worksheets || []);
        setCloudStatus('online');
      } else {
        setCloudStatus('offline');
      }
    } catch (e) {
      setCloudStatus('error');
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const savedStats = localStorage.getItem('estudos_stats');
      const savedPrizes = localStorage.getItem('estudos_prizes');
      const savedWorksheets = localStorage.getItem('estudos_worksheets');
      
      if (savedStats) setStats(prev => ({ ...defaultStats, ...JSON.parse(savedStats) }));
      if (savedPrizes) setPrizes(JSON.parse(savedPrizes));
      if (savedWorksheets) setWorksheets(JSON.parse(savedWorksheets));
    } catch (e) {
      console.warn("Erro ao ler localStorage:", e);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    const sync = async () => {
      try {
        localStorage.setItem('estudos_stats', JSON.stringify(stats));
        localStorage.setItem('estudos_prizes', JSON.stringify(prizes));
        localStorage.setItem('estudos_worksheets', JSON.stringify(worksheets));
      } catch (e) {
        console.error("LocalStorage está cheio!");
      }

      if (!isSupabaseConfigured) return;
      setCloudStatus('syncing');
      try {
        await saveToCloud({ stats, prizes, worksheets });
        setCloudStatus('online');
      } catch (e) {
        setCloudStatus('error');
      }
    };
    const timeoutId = setTimeout(sync, 1500);
    return () => clearTimeout(timeoutId);
  }, [stats, prizes, worksheets]);

  const handleImportAllData = (encodedData: string) => {
    try {
      const decoded = decodeURIComponent(escape(atob(encodedData)));
      const data = JSON.parse(decoded);
      if (data.prizes) setPrizes(data.prizes);
      if (data.worksheets) setWorksheets(data.worksheets);
      if (data.stats) setStats({ ...defaultStats, ...data.stats });
      setCurrentQuestions([]);
      setSessionProgress(null);
    } catch (e) {
      throw new Error("Dados inválidos");
    }
  };

  const handleExerciseComplete = (correct: number, earnedCredits: number, finalQuestionsCount: number) => {
    const currentSub = selectedSubject || Subject.PORTUGUESE;
    const today = new Date().getDay();
    const isDoubleDay = stats.doubleCreditDays.includes(today);
    const finalEarnedCredits = isDoubleDay ? earnedCredits * 2 : earnedCredits;
    
    // Helena ganha 10 pontos por cada resposta correta para desbloquear avatares
    const earnedPoints = correct * 10;

    setStats(prev => {
      const newTotalQuestions = (prev.totalQuestions || 0) + finalQuestionsCount;
      const newCorrectAnswers = (prev.correctAnswers || 0) + correct;
      const updatedSubjectStats = { ...prev.subjectStats };
      updatedSubjectStats[currentSub] = {
        totalMinutes: (updatedSubjectStats[currentSub]?.totalMinutes || 0) + 10,
        totalQuestions: (updatedSubjectStats[currentSub]?.totalQuestions || 0) + finalQuestionsCount,
        correctAnswers: (updatedSubjectStats[currentSub]?.correctAnswers || 0) + correct,
      };

      let updatedRecentIds = [...(prev.recentWorksheetIds || [])];
      if (sessionProgress?.worksheetId) {
        updatedRecentIds = [sessionProgress.worksheetId, ...updatedRecentIds].slice(0, 2);
      }

      return {
        ...prev,
        credits: (prev.credits || 0) + finalEarnedCredits,
        points: (prev.points || 0) + earnedPoints,
        totalQuestions: newTotalQuestions,
        correctAnswers: newCorrectAnswers,
        accuracy: newTotalQuestions > 0 ? Math.round((newCorrectAnswers / newTotalQuestions) * 100) : 0,
        dailyMinutes: (prev.dailyMinutes || 0) + 10,
        subjectStats: updatedSubjectStats,
        recentWorksheetIds: updatedRecentIds
      };
    });

    setCurrentQuestions([]);
    setSessionProgress(null);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] pb-12">
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={initData}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-xl backdrop-blur-md border-2 transition-all ${
          cloudStatus === 'online' ? 'bg-green-100 text-green-600 border-green-300' :
          cloudStatus === 'syncing' ? 'bg-blue-100 text-blue-600 border-blue-300 animate-pulse' :
          cloudStatus === 'error' ? 'bg-red-100 text-red-600 border-red-300' :
          'bg-gray-100 text-gray-500 border-gray-300 opacity-60'
        }`}>
          {cloudStatus === 'online' ? <Cloud className="w-4 h-4" /> : 
           cloudStatus === 'syncing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : 
           cloudStatus === 'error' ? <AlertTriangle className="w-4 h-4" /> :
           <WifiOff className="w-4 h-4" />}
          <span className="hidden sm:inline">{cloudStatus === 'online' ? 'DADOS SEGUROS' : cloudStatus === 'syncing' ? 'A GRAVAR...' : 'MODO LOCAL'}</span>
        </button>
      </div>

      {view === 'dashboard' && (
        <Dashboard 
          stats={stats} 
          prizes={prizes} 
          onSelectSubject={(s) => { setSelectedSubject(s); setView('admin'); }} 
          onOpenShop={() => setView('shop')} 
          onOpenAvatarShop={() => setView('avatars')}
          onOpenAdmin={() => setShowPasswordPrompt(true)} 
        />
      )}

      {view === 'exercise' && (
        <ExerciseRoom 
          questions={currentQuestions}
          subject={selectedSubject || Subject.PORTUGUESE}
          worksheetImages={sessionProgress?.worksheetImages || []}
          initialIndex={sessionProgress?.currentIndex || 0}
          initialCorrectCount={sessionProgress?.correctCount || 0}
          initialTotalCredits={sessionProgress?.totalCredits || 0}
          globalCredits={stats.credits}
          onProgressUpdate={(p) => setSessionProgress({ ...p, worksheetId: sessionProgress?.worksheetId })}
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

      {view === 'avatars' && (
        <AvatarShop 
          stats={stats}
          onSelect={(avatar) => {
            setStats(prev => ({ ...prev, selectedAvatarUrl: avatar.url }));
            setView('dashboard');
          }}
          onUnlock={(avatar) => {
            // Unlocks are based on accumulated points, not "spent"
            if (stats.points >= avatar.pointsRequired) {
              setStats(prev => ({ 
                ...prev, 
                unlockedAvatarIds: [...prev.unlockedAvatarIds, avatar.id],
                selectedAvatarUrl: avatar.url
              }));
            }
          }}
          onClose={() => setView('dashboard')}
        />
      )}

      {view === 'admin' && (
        <WorksheetUploader 
          subject={selectedSubject || Subject.PORTUGUESE}
          savedWorksheets={selectedSubject === Subject.ALL ? worksheets : worksheets.filter(w => w.subject === selectedSubject)}
          recentWorksheetIds={stats.recentWorksheetIds}
          onQuestionsGenerated={(qs, imgs, id) => {
            setCurrentQuestions(qs);
            setSessionProgress({ currentIndex: 0, correctCount: 0, totalCredits: 0, worksheetImages: imgs, worksheetId: id });
            setView('exercise');
          }}
          onClose={() => setView('dashboard')}
        />
      )}

      {view === 'backoffice' && (
        <Backoffice 
          prizes={prizes} 
          worksheets={worksheets} 
          wonHistory={stats.wonHistory} 
          subjectStats={stats.subjectStats} 
          doubleCreditDays={stats.doubleCreditDays} 
          credits={stats.credits}
          cloudStatus={cloudStatus}
          onUpdateDoubleCreditDays={(d) => setStats(prev => ({...prev, doubleCreditDays: d}))} 
          onUpdateCredits={(c) => setStats(prev => ({...prev, credits: c}))}
          onUpdatePrizes={setPrizes} 
          onUpdateWorksheets={setWorksheets} 
          onImportData={handleImportAllData}
          onClose={() => setView('dashboard')} 
        />
      )}

      {showPasswordPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Modo Pais</h2>
              <button onClick={() => setShowPasswordPrompt(false)}><X className="text-gray-400" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if(passwordInput === ADMIN_PASSWORD) { 
                setView('backoffice'); setShowPasswordPrompt(false); setPasswordInput(''); setPasswordError(false); 
              } else setPasswordError(true);
            }}>
              <p className="text-gray-500 mb-4 text-sm">Insira o código de acesso.</p>
              <input type="password" autoFocus value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className={`w-full p-4 border-2 rounded-xl mb-4 text-center text-2xl font-bold tracking-widest ${passwordError ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} placeholder="******" />
              <button type="submit" className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold shadow-lg">Entrar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
