
import React from 'react';
import { Avatar, UserStats } from '../types';
import { AVATAR_COLLECTION } from '../constants';
import { ArrowLeft, Star, CheckCircle2, Lock, Sparkles, Trophy } from 'lucide-react';

interface AvatarShopProps {
  stats: UserStats;
  onSelect: (avatar: Avatar) => void;
  onUnlock: (avatar: Avatar) => void;
  onClose: () => void;
}

const AvatarShop: React.FC<AvatarShopProps> = ({ stats, onSelect, onUnlock, onClose }) => {
  const currentPoints = stats.points || 0;

  return (
    <div className="max-w-5xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <button onClick={onClose} className="self-start flex items-center gap-2 text-gray-500 font-black hover:text-gray-800 bg-white px-6 py-3 rounded-2xl shadow-sm border-2 border-gray-100 transition-all active:scale-95 uppercase text-xs tracking-widest">
          <ArrowLeft size={20} /> Dashboard
        </button>
        
        <div className="flex gap-4">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-4 rounded-[30px] border-4 border-white flex items-center gap-4 shadow-xl">
            <div className="p-2 bg-white/20 rounded-full">
              <Star className="text-white w-8 h-8 fill-current" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-none">Total de Estrelas</p>
              <p className="text-3xl font-black text-white leading-tight">{currentPoints}</p>
            </div>
          </div>
          
          <div className="bg-indigo-500 px-8 py-4 rounded-[30px] border-4 border-white flex items-center gap-4 shadow-xl hidden sm:flex">
            <Trophy className="text-white w-8 h-8" />
            <div>
              <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest leading-none">Nível</p>
              <p className="text-3xl font-black text-white leading-tight">
                {currentPoints < 1000 ? 'Bronze' : currentPoints < 5000 ? 'Prata' : 'Ouro'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-16 px-4">
        <h1 className="text-5xl font-black text-gray-800 mb-4 tracking-tighter">Mundo dos Monstros 👾</h1>
        <p className="text-xl text-gray-500 font-bold max-w-2xl mx-auto">
          Escolhe a expressão que mais combina contigo hoje! Desbloqueia <span className="text-blue-500">30 caras de monstros</span> divertidas com as tuas estrelas.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {AVATAR_COLLECTION.map((avatar) => {
          const isUnlocked = stats.unlockedAvatarIds.includes(avatar.id) || currentPoints >= avatar.pointsRequired;
          const isSelected = stats.selectedAvatarUrl === avatar.url;
          const progress = Math.min((currentPoints / avatar.pointsRequired) * 100, 100);

          return (
            <div 
              key={avatar.id}
              className={`relative group bg-white rounded-[45px] p-5 border-4 transition-all duration-500 ${
                isSelected ? 'border-blue-500 shadow-[0_20px_50px_rgba(59,130,246,0.3)] scale-110 z-10' : 
                isUnlocked ? 'border-green-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-2' : 'border-gray-50 opacity-90'
              }`}
            >
              <div className={`relative aspect-square rounded-[35px] overflow-hidden mb-5 border-2 border-white shadow-inner transition-colors ${
                isSelected ? 'bg-gradient-to-br from-blue-50 to-blue-100' :
                isUnlocked ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gray-50'
              }`}>
                <img 
                  src={avatar.url} 
                  alt="Avatar" 
                  className={`w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110 ${!isUnlocked ? 'grayscale brightness-75 opacity-40 blur-[2px]' : 'drop-shadow-md'}`} 
                />
                
                {!isUnlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <Lock className="text-gray-400 w-10 h-10 mb-2 opacity-50" />
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-400" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}
                
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-blue-500 text-white p-2 rounded-full shadow-lg border-2 border-white animate-in zoom-in">
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>

              <div className="text-center">
                {isSelected ? (
                  <div className="flex items-center justify-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                    <Sparkles size={12} /> Selecionado
                  </div>
                ) : isUnlocked ? (
                  <button 
                    onClick={() => onSelect(avatar)}
                    className="w-full bg-green-500 text-white py-3 rounded-2xl font-black text-xs shadow-md hover:bg-green-600 active:scale-95 transition-all uppercase tracking-widest"
                  >
                    Escolher
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-amber-600 font-black">
                      <Star size={16} fill="currentColor" />
                      <span className="text-lg">{avatar.pointsRequired}</span>
                    </div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Estrelas Necessárias</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarShop;
