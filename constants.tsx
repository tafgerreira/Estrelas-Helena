
import React from 'react';
import { BookOpen, Calculator, Globe, GraduationCap, Sparkles } from 'lucide-react';
import { Subject, Avatar } from './types';

export const SUBJECT_CONFIG = {
  [Subject.PORTUGUESE]: {
    color: 'bg-rose-400',
    icon: <BookOpen className="w-10 h-10 text-white" />,
    gradient: 'from-rose-400 to-rose-600'
  },
  [Subject.MATH]: {
    color: 'bg-blue-400',
    icon: <Calculator className="w-10 h-10 text-white" />,
    gradient: 'from-blue-400 to-blue-600'
  },
  [Subject.NSS]: {
    color: 'bg-green-400',
    icon: <Globe className="w-10 h-10 text-white" />,
    gradient: 'from-green-400 to-green-600'
  },
  [Subject.ENGLISH]: {
    color: 'bg-purple-400',
    icon: <GraduationCap className="w-10 h-10 text-white" />,
    gradient: 'from-purple-400 to-purple-600'
  },
  [Subject.ALL]: {
    color: 'bg-amber-400',
    icon: <Sparkles className="w-10 h-10 text-white" />,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500'
  }
};

export const INITIAL_PRIZES = [
  { id: '1', name: 'Gelado Especial', cost: 5, image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=400&h=400&auto=format&fit=crop', unlocked: false },
  { id: '2', name: '30 min de Videojogos', cost: 10, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&h=400&auto=format&fit=crop', unlocked: false },
  { id: '3', name: 'Cinema em Família', cost: 25, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400&h=400&auto=format&fit=crop', unlocked: false },
  { id: '4', name: 'Brinquedo Novo', cost: 50, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=400&h=400&auto=format&fit=crop', unlocked: false }
];

// Gerador de Expressões de Monstros usando DiceBear v9
const createMonsterFace = (id: string, seed: string, points: number, bg: string = 'b6e3f4') => ({
  id,
  url: `https://api.dicebear.com/9.x/big-smile/svg?seed=${seed}&backgroundColor=${bg}`,
  pointsRequired: points
});

export const AVATAR_COLLECTION: Avatar[] = [
  // --- TIER 1: MONSTRINHOS INICIAIS (0-250 estrelas) ---
  createMonsterFace('av-1', 'BlueyMonster', 0, 'b6e3f4'), 
  createMonsterFace('av-2', 'Greeny', 0, 'dcfce7'),
  createMonsterFace('av-3', 'Pinky', 0, 'fdf2f8'),
  createMonsterFace('av-4', 'Sunny', 50, 'fef9c3'),
  createMonsterFace('av-5', 'Berry', 100, 'f5f3ff'),
  createMonsterFace('av-6', 'Orange', 150, 'ffedd5'),
  createMonsterFace('av-7', 'Teal', 200, 'ccfbf1'),
  createMonsterFace('av-8', 'Rosie', 250, 'fee2e2'),

  // --- TIER 2: MONSTROS TRAQUINAS (300-900 estrelas) ---
  createMonsterFace('av-9', 'SkyMonster', 300, '3b82f6'),
  createMonsterFace('av-10', 'LimeMonster', 350, '84cc16'),
  createMonsterFace('av-11', 'CherryMonster', 400, 'ec4899'),
  createMonsterFace('av-12', 'GrapeMonster', 450, 'a855f7'),
  createMonsterFace('av-13', 'BananaMonster', 500, 'eab308'),
  createMonsterFace('av-14', 'AquaMonster', 600, '06b6d4'),
  createMonsterFace('av-15', 'FireMonster', 700, 'ef4444'),
  createMonsterFace('av-16', 'InkMonster', 800, '6366f1'),
  createMonsterFace('av-17', 'MintMonster', 900, '10b981'),

  // --- TIER 3: MONSTROS LENDÁRIOS (1000-5000 estrelas) ---
  createMonsterFace('av-18', 'Vamp', 1000, '4c1d95'),
  createMonsterFace('av-19', 'Zill', 1200, '064e3b'),
  createMonsterFace('av-20', 'Gold', 1400, 'fbbf24'),
  createMonsterFace('av-21', 'Cand', 1600, 'db2777'),
  createMonsterFace('av-22', 'Clou', 1800, '0ea5e9'),
  createMonsterFace('av-23', 'Maga', 2000, '991b1b'),
  createMonsterFace('av-24', 'Ghos', 2500, 'f8fafc'),
  createMonsterFace('av-25', 'Shad', 3000, '1e293b'),
  createMonsterFace('av-26', 'Neon', 4000, '22c55e'),

  // --- TIER MESTRE: EXPRESSÕES RARAS (5000+ estrelas) ---
  createMonsterFace('av-27', 'Super', 5000, '1d4ed8'),
  createMonsterFace('av-28', 'Queen', 7500, 'be185d'),
  createMonsterFace('av-29', 'King', 10000, 'ca8a04'),
  createMonsterFace('av-30', 'Boss', 25000, '000000'),
];
