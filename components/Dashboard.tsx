
import React from 'react';
import { Subject, UserStats, Prize } from '../types';
import { SUBJECT_CONFIG } from '../constants';
import { Wallet, Sparkles, Star, ShoppingBag, Settings } from 'lucide-react';

interface DashboardProps {
  stats: UserStats;
  prizes: Prize[];
  onSelectSubject: (subject: Subject) => void;
  onOpenShop: () => void;
  onOpenAdmin: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, prizes, onSelectSubject, onOpenShop, onOpenAdmin }) => {
  const nextPrize = prizes.filter(p => !p.unlocked).sort((a,b) => a.cost - b.cost)[0];
  const progress = nextPrize ? Math.min((stats.credits / nextPrize.cost) * 100, 100) : 0;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-700">
      {/* Header com Saldo e Avatar */}
      <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[40px] shadow-xl border-4 border-white">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-300 to-rose-400 rounded-full border-4 border-white shadow-lg overflow-hidden shrink-0">
             <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Helena" alt="Avatar da Helena" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Olá, Helena! 🌟</h1>
            <p className="text-gray-500 font-bold">Pronta para ganhar prémios hoje?</p>
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
            <ShoppingBag className="w-6 h-6" /> Loja
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
                <span>Meta de Estrelas</span>
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
          {/* Decoração de fundo */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-150"></div>
        </div>
      )}

      {/* Seleção de Disciplinas */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-black text-gray-800">O que vamos estudar?</h2>
          <button 
            onClick={onOpenAdmin} 
            className="text-gray-400 hover:text-blue-500 text-xs font-bold flex items-center gap-1 p-2 rounded-lg hover:bg-white transition-colors"
          >
            <Settings className="w-4 h-4" /> Modo Pais
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {(Object.keys(Subject) as Array<keyof typeof Subject>).map((key) => {
            const subject = Subject[key];
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
                  <span>Abrir Fichas</span>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>
                {/* Elementos decorativos */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
