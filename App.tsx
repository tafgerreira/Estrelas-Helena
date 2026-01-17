
import React, { useState, useEffect, useRef } from 'react';
import { Subject, UserStats, Question, Prize, Worksheet, SubjectMetrics } from './types';
import { INITIAL_PRIZES } from './constants';
import Dashboard from './components/Dashboard';
import ExerciseRoom from './components/ExerciseRoom';
import Shop from './components/Shop';
import AvatarShop from './components/AvatarShop';
import WorksheetUploader from './components/WorksheetUploader';
import Backoffice from './components/Backoffice';
import { X, AlertTriangle, Cloud, RefreshCw, WifiOff } from 'lucide-react';
import { saveToCloud, loadFromCloud, isSupabaseConfigured } from './services/supabaseService';

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
  const [isLoaded, setIsLoaded] = useState(false);

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
    selectedAvatarUrl: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Buster&backgroundColor=FF8C00',
    unlockedAvatarIds: ['mon-1', 'mon-2', 'mon-3', 'mon-4']
  };

  const [stats, setStats] = useState<UserStats>(defaultStats);
  const [prizes, setPrizes] = useState<Prize[]>(INITIAL_PRIZES);
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [sessionProgress, setSessionProgress] = useState<SessionProgress | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const initData = async () => {
    setCloudStatus('syncing');
    
    try {
      const localStats = localStorage.getItem('estudos_stats');
      const localPrizes = localStorage.getItem('estudos_prizes');
      const localWorksheets = localStorage.getItem('estudos_worksheets');

      // Carregar local primeiro para interface imediata
      if (localStats) setStats(prev => ({ ...defaultStats, ...JSON.parse(localStats) }));
      if (localPrizes) setPrizes(JSON.parse(localPrizes));
      if (localWorksheets) setWorksheets(JSON.parse(localWorksheets));

      // Tentar Nuvem
      const cloudData = isSupabaseConfigured ? await loadFromCloud() : null;
      
      if (cloudData) {
        if (cloudData.stats) setStats(prev => ({ ...prev, ...cloudData.stats }));
        if (cloudData.prizes?.length) setPrizes(cloudData.prizes);
        if (cloudData.worksheets?.length) setWorksheets(cloudData.worksheets);
        setCloudStatus('online');
      } else {
        setCloudStatus(isSupabaseConfigured ? 'error' : 'offline');
      }
    } catch (e) {
      setCloudStatus('error');
    } finally {
      setTimeout(() => setIsLoaded(true), 500);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const sync = async () => {
      localStorage.setItem('estudos_stats', JSON.stringify(stats));
      localStorage.setItem('estudos_prizes', JSON.stringify(prizes));
      localStorage.setItem('estudos_worksheets', JSON.stringify(worksheets));

      if (isSupabaseConfigured) {
        setCloudStatus('syncing');
        const success = await saveToCloud({ stats, prizes, worksheets });
        setCloudStatus(success ? 'online' : 'error');
      }
    };

    const timeoutId = setTimeout(sync, 2000); 
    return () => clearTimeout(timeoutId);
  }, [stats, prizes, worksheets, isLoaded]);

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
    <div className="min-h-screen bg-[#f0f9ff] pb-12 text-[#1e293b]">
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={initData}
          title="Forçar Sincronização"
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
          <span className="hidden sm:inline">
            {cloudStatus === 'online' ? 'NUVEM ATIVA' : 
             cloudStatus === 'syncing' ? 'A SINCRONIZAR...' : 
             cloudStatus === 'error' ? 'ERRO DE LIGAÇÃO' : 'MODO LOCAL'}
          </span>
        </button>
      </div>

      {!isLoaded && (
        <div className="fixed inset-0 z-[100] bg-[#f0f9ff] flex flex-col items-center justify-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="font-black text-blue-600 animate-pulse uppercase tracking-widest text-xs">A carregar o teu mundo...</p>
        </div>
      )}

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
