
import React from 'react';
import { Avatar, UserStats } from '../types';
import { AVATAR_COLLECTION } from '../constants';
import { ArrowLeft, Star, CheckCircle2, Lock, Sparkles, Trophy, Loader2 } from 'lucide-react';

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
          <ArrowLeft size={20} /> Voltar
        </button>
        
        <div className="flex gap-4">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 px-8 py-4 rounded-[30px] border-4 border-white flex items-center gap-4 shadow-xl">
            <Star className="text-white w-8 h-8 fill-current" />
            <div>
              <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-none">Tuas Estrelas</p>
              <p className="text-3xl font-black text-white leading-tight">{currentPoints}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mb-16 px-4">
        <h1 className="text-5xl font-black text-gray-800 mb-4 tracking-tighter">Mansão dos Monstros 👾</h1>
        <p className="text-xl text-gray-500 font-bold max-w-2xl mx-auto">
          Qual destes monstros vai ser o teu companheiro de estudos hoje?
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {AVATAR_COLLECTION.map((avatar: any) => {
          const isUnlocked = stats.unlockedAvatarIds.includes(avatar.id) || currentPoints >= avatar.pointsRequired;
          const isSelected = stats.selectedAvatarUrl === avatar.url;
          const progress = Math.min((currentPoints / avatar.pointsRequired) * 100, 100);

          return (
            <div 
              key={avatar.id}
              className={`relative group bg-white rounded-[45px] p-5 border-4 transition-all duration-300 ${
                isSelected ? 'border-blue-500 shadow-2xl scale-105 z-10' : 
                isUnlocked ? 'border-green-100 hover:border-blue-200 hover:-translate-y-2' : 'border-gray-50 opacity-80'
              }`}
            >
              <div className={`relative aspect-square rounded-[35px] overflow-hidden mb-4 border-2 border-white shadow-inner transition-colors ${
                isSelected ? 'bg-blue-50' : isUnlocked ? 'bg-green-50' : 'bg-gray-100'
              }`}>
                <img 
                  src={avatar.url} 
                  alt={avatar.name} 
                  className={`relative w-full h-full object-contain p-2 transition-all duration-500 ${!isUnlocked ? 'grayscale brightness-75 opacity-20' : 'drop-shadow-xl scale-110'}`} 
                />
                
                {!isUnlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <Lock className="text-gray-400 w-10 h-10 mb-2 opacity-50" />
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                       <div className="h-full bg-amber-400 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="font-black text-gray-700 text-sm mb-3 truncate">{avatar.name}</p>
                {isSelected ? (
                  <div className="flex items-center justify-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 py-2 rounded-xl">
                    <Sparkles size={12} /> Amigo Atual
                  </div>
                ) : isUnlocked ? (
                  <button 
                    onClick={() => onSelect(avatar)}
                    className="w-full bg-gradient-to-b from-green-400 to-green-600 text-white py-2.5 rounded-xl font-black text-[10px] shadow-md hover:scale-105 active:scale-95 transition-all uppercase tracking-widest"
                  >
                    Escolher
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-amber-600 font-black bg-amber-50 py-2 rounded-xl">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm">{avatar.pointsRequired}</span>
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
