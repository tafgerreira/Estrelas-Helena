import React from 'react';
import { Prize } from '../types';
import { Lock, Unlock, ShoppingBag, ArrowLeft } from 'lucide-react';

interface ShopProps {
  credits: number;
  prizes: Prize[];
  onBuy: (prizeId: string) => void;
  onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ credits, prizes, onBuy, onClose }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onClose} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-800">
          <ArrowLeft /> Voltar
        </button>
        <div className="bg-yellow-400 text-white px-6 py-2 rounded-full font-bold shadow-md flex items-center gap-2">
          <ShoppingBag className="w-5 h-5" />
          Teu Saldo: {credits.toFixed(2)}€
        </div>
      </div>

      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">A Tua Loja de Prémios 🎁</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {prizes.map((prize) => {
          const canAfford = credits >= prize.cost;
          const isUnlocked = prize.unlocked;

          return (
            <div 
              key={prize.id}
              className={`bg-white rounded-3xl overflow-hidden shadow-lg border-4 transition-all duration-300 ${isUnlocked ? 'border-green-400 bg-green-50' : 'border-white'}`}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={prize.image} 
                  alt={prize.name} 
                  className={`w-full h-full object-cover ${!isUnlocked && !canAfford ? 'grayscale brightness-50' : ''}`}
                />
                {!isUnlocked && !canAfford && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 backdrop-blur-sm p-4 rounded-2xl flex flex-col items-center">
                      <Lock className="text-white w-8 h-8 mb-1" />
                      <span className="text-white text-xs font-bold">BLOQUEADO</span>
                    </div>
                  </div>
                )}
                {isUnlocked && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <Unlock className="w-5 h-5" />
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{prize.name}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black text-yellow-600">{prize.cost.toFixed(2)}€</span>
                  {isUnlocked ? (
                    <span className="text-green-600 font-bold">ADQUIRIDO!</span>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => onBuy(prize.id)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all ${
                        canAfford 
                          ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md active:scale-95' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Comprar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Shop;