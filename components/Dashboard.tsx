
import React from 'react';
import { Subject, UserStats, Prize } from '../types';
import { SUBJECT_CONFIG } from '../constants';
import { Wallet, Sparkles, Star, Gift, Settings, UserCircle, Trophy } from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  prizes: Prize[];
  onSelectSubject: (subject: Subject) => void;
  onOpenShop: () => void;
  onOpenAvatarShop: () => void;
  onOpenAdmin: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, prizes, onSelectSubject, onOpenShop, onOpenAvatarShop, onOpenAdmin }) => {
  const nextPrize = prizes.filter(p => !p.unlocked).sort((a,b) => a.cost - b.cost)[0];
  const progress = nextPrize ? Math.min((stats.credits / nextPrize.cost) * 100, 100) : 0;
  const currentPoints = stats.points || 0;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      {/* Header com Saldo e Avatar */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[40px] shadow-xl border-4 border-white">
        <div className="flex items-center gap-6">
          <div className="relative">
            <button 
              onClick={onOpenAvatarShop}
              className="group relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-pink-100 to-rose-200 rounded-[35px] border-4 border-white shadow-2xl overflow-hidden shrink-0 transition-all hover:scale-105 active:scale-95"
            >
               <img 
                 src={stats.selectedAvatarUrl || "https://api.dicebear.com/7.x/adventurer/svg?seed=Helena"} 
                 alt="Avatar da Helena" 
                 className="w-full h-full object-contain p-2"
               />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter">
                 <UserCircle size={20} className="mb-1" />
                 Mudar
               </div>
            </button>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-white px-3 py-1 rounded-full border-2 border-white shadow-lg flex items-center gap-1 animate-in zoom-in delay-300">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-black">{currentPoints}</span>
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Olá, Helena! 🌟</h1>
            <p className="text-gray-500 font-bold flex items-center gap-1.5">
              <Trophy size={16} className="text-indigo-400" />
              Nível {currentPoints < 1000 ? 'Bronze' : currentPoints < 5000 ? 'Prata' : 'Ouro'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-yellow-100 px-8 py-4 rounded-3xl border-2 border-yellow-200 flex flex-1 items-center justify-center gap-3">
            <Wallet className="text-yellow-600 w-8 h-8" />
            <div>
              <p className="text-[10px] text-yellow-700 font-black uppercase tracking-widest">O Teu Mealheiro</p>
              <p className="text-3xl font-black text-yellow-700 leading-none">{stats.credits.toFixed(2)}€</p>
            </div>
          </div>
          <button 
            onClick={onOpenShop} 
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-4 rounded-3xl font-black text-xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2"
          >
            <Gift className="w-6 h-6" /> Baú
          </button>
        </div>
      </header>

      {/* Progresso do Próximo Prémio */}
      {nextPrize && (
        <div 
          className="bg-gradient-to-r from-orange-400 to-rose-500 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.01]" 
          onClick={onOpenShop}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-5 rounded-3xl backdrop-blur-md">
                <Sparkles className="w-10 h-10 text-yellow-100" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Estás a caminho do teu prémio!</h3>
                <p className="font-bold text-white/90">
                  Faltam apenas <span className="bg-white/20 px-2 py-0.5 rounded-lg">{(nextPrize.cost - stats.credits).toFixed(2)}€</span> para: <span className="underline decoration-2">{nextPrize.name}</span>
                </p>
              </div>
            </div>
            <div className="w-full md:w-64">
              <div className="flex justify-between text-xs font-black mb-2 uppercase tracking-widest">
                <span>Meta para o Baú</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-5 bg-black/10 rounded-full overflow-hidden p-1">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000 flex items-center justify-end pr-1 shadow-sm" 
                  style={{ width: `${progress}%` }}
                >
                  {progress > 15 && <Star className="w-3 h-3 text-orange-400 fill-current" />}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seleção de Disciplinas */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-black text-gray-800">Escolhe o teu próximo desafio! 🚀</h2>
          <button 
            onClick={onOpenAdmin} 
            className="text-gray-400 hover:text-blue-500 text-xs font-bold flex items-center gap-1 p-2 rounded-lg hover:bg-white transition-colors"
          >
            <Settings className="w-4 h-4" /> Modo Pais
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {(Object.values(Subject) as Subject[]).map((subject) => {
            const config = SUBJECT_CONFIG[subject];
            return (
              <button
                key={subject}
                onClick={() => onSelectSubject(subject)}
                className={`group relative p-8 rounded-[40px] bg-gradient-to-br ${config.gradient} shadow-2xl hover:-translate-y-3 transition-all duration-500 text-left overflow-hidden h-64 flex flex-col justify-between`}
              >
                <div className="relative z-10">
                  <div className="p-4 bg-white/20 backdrop-blur-md rounded-3xl inline-block mb-4">
                    {config.icon}
                  </div>
                  <h3 className="text-3xl font-black text-white leading-tight">{subject}</h3>
                </div>
                <div className="relative z-10 flex items-center gap-2 text-white/80 font-bold text-sm">
                  <span>Abrir Missão</span>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
