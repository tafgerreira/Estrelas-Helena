
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

// Gerador de Avatares Squish & Ami
const createSquish = (id: string, seed: string, points: number, type: 'big-smile' | 'fun-emoji' | 'bottts' | 'adventurer' = 'big-smile', bg = 'ffd5dc') => ({
  id,
  url: `https://api.dicebear.com/7.x/${type}/svg?seed=${seed}&backgroundColor=${bg}`,
  pointsRequired: points
});

export const AVATAR_COLLECTION: Avatar[] = [
  // --- INICIAIS (0 - 100) ---
  createSquish('av-1', 'Helena', 0, 'big-smile', 'ffd5dc'),
  createSquish('av-2', 'MallowCat', 0, 'fun-emoji', 'd1d4f9'),
  createSquish('av-3', 'Pinkie', 0, 'big-smile', 'b6e3f4'),
  createSquish('av-4', 'SquishyPanda', 50, 'fun-emoji', 'c0aede'),
  createSquish('av-5', 'Bluey', 75, 'big-smile', 'ffdfbf'),
  createSquish('av-6', 'AmiBunny', 100, 'big-smile', 'd1f4d1'),

  // --- FAMÍLIA JARDIM (150 - 500) ---
  createSquish('av-7', 'Bee', 150, 'fun-emoji', 'fef08a'),
  createSquish('av-8', 'Ladybug', 200, 'fun-emoji', 'fca5a5'),
  createSquish('av-9', 'Flower', 250, 'big-smile', 'd1f4d1'),
  createSquish('av-10', 'Leafy', 300, 'big-smile', 'bbf7d0'),
  createSquish('av-11', 'Sun', 400, 'fun-emoji', 'fde047'),
  createSquish('av-12', 'Cloud', 500, 'big-smile', 'e0f2fe'),

  // --- FAMÍLIA DOCES (600 - 1250) ---
  createSquish('av-13', 'Candy', 600, 'fun-emoji', 'fbcfe8'),
  createSquish('av-14', 'Cookie', 700, 'big-smile', 'fed7aa'),
  createSquish('av-15', 'Donut', 800, 'fun-emoji', 'ddd6fe'),
  createSquish('av-16', 'Cupcake', 900, 'big-smile', 'fecdd3'),
  createSquish('av-17', 'Marshmallow', 1000, 'fun-emoji', 'f0f9ff'),
  createSquish('av-18', 'Lollipop', 1250, 'big-smile', 'fae8ff'),

  // --- FAMÍLIA AMIGURUMI (1500 - 3000) ---
  createSquish('av-19', 'Wooly', 1500, 'adventurer', 'ede9fe'),
  createSquish('av-20', 'Stitch', 1750, 'bottts', 'e0e7ff'),
  createSquish('av-21', 'Crochet', 2000, 'adventurer', 'ffedd5'),
  createSquish('av-22', 'Buttons', 2250, 'bottts', 'ecfdf5'),
  createSquish('av-23', 'Patch', 2500, 'adventurer', 'fdf2f8'),
  createSquish('av-24', 'Thread', 3000, 'bottts', 'f0fdf4'),

  // --- FAMÍLIA SQUISHY MONSTERS (3500 - 6000) ---
  createSquish('av-25', 'Gloop', 3500, 'fun-emoji', 'ccfbf1'),
  createSquish('av-26', 'Zorch', 4000, 'bottts', 'fee2e2'),
  createSquish('av-27', 'Bloop', 4500, 'fun-emoji', 'dcfce7'),
  createSquish('av-28', 'Fuzz', 5000, 'big-smile', 'fae8ff'),
  createSquish('av-29', 'Slimey', 5500, 'fun-emoji', 'fef9c3'),
  createSquish('av-30', 'Ooze', 6000, 'bottts', 'f3e8ff'),

  // --- FAMÍLIA ESPACIAL (7000 - 12000) ---
  createSquish('av-31', 'Nova', 7000, 'fun-emoji', '1e1b4b'),
  createSquish('av-32', 'Orion', 8000, 'big-smile', '312e81'),
  createSquish('av-33', 'Starry', 9000, 'fun-emoji', '4338ca'),
  createSquish('av-34', 'Comet', 10000, 'bottts', '3730a3'),
  createSquish('av-35', 'Moon', 11000, 'big-smile', '1e293b'),
  createSquish('av-36', 'Nebula', 12000, 'fun-emoji', '4c1d95'),

  // --- FAMÍLIA REINO MÁGICO (13000 - 20000) ---
  createSquish('av-37', 'Unicorn', 13000, 'big-smile', 'fdf4ff'),
  createSquish('av-38', 'Dragon', 14000, 'fun-emoji', 'f0fdf4'),
  createSquish('av-39', 'Phoenix', 15000, 'big-smile', 'fff7ed'),
  createSquish('av-40', 'Griffin', 16000, 'fun-emoji', 'fefce8'),
  createSquish('av-41', 'Mermaid', 18000, 'big-smile', 'ecfeff'),
  createSquish('av-42', 'Fairy', 20000, 'big-smile', 'fff1f2'),

  // --- FAMÍLIA ROBÓTICA SMILE (22000 - 35000) ---
  createSquish('av-43', 'CyberSquish', 22000, 'bottts', 'f8fafc'),
  createSquish('av-44', 'DataDrop', 24000, 'bottts', 'f1f5f9'),
  createSquish('av-45', 'PixelPuff', 26000, 'bottts', 'e2e8f0'),
  createSquish('av-46', 'Circuit', 28000, 'bottts', 'cbd5e1'),
  createSquish('av-47', 'Nano', 30000, 'bottts', '94a3b8'),
  createSquish('av-48', 'GigaPuff', 35000, 'bottts', '64748b'),

  // --- FAMÍLIA LENDÁRIA (40000 - 100000) ---
  createSquish('av-49', 'GoldenSquish', 40000, 'fun-emoji', 'fef3c7'),
  createSquish('av-50', 'DiamondPuff', 45000, 'big-smile', 'e0f2fe'),
  createSquish('av-51', 'RainbowAmi', 50000, 'adventurer', 'fae8ff'),
  createSquish('av-52', 'Crystal', 55000, 'fun-emoji', 'f5f3ff'),
  createSquish('av-53', 'Zen', 60000, 'big-smile', 'f0fdf4'),
  createSquish('av-54', 'Shadow', 65000, 'fun-emoji', '0f172a'),
  createSquish('av-55', 'Light', 70000, 'big-smile', 'ffffff'),
  createSquish('av-56', 'Master', 75000, 'bottts', '171717'),
  createSquish('av-57', 'Ethereal', 80000, 'fun-emoji', 'faf5ff'),
  createSquish('av-58', 'Infinity', 85000, 'big-smile', 'fdf2f8'),
  createSquish('av-59', 'Universe', 90000, 'fun-emoji', '020617'),
  createSquish('av-60', 'TheOne', 100000, 'bottts', 'facc15'),
];
