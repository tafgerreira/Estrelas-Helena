
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

// Gerador de Avatares baseado nas imagens de referência
const createSquish = (id: string, seed: string, points: number, type: string = 'fun-emoji', bg = 'ffd5dc') => ({
  id,
  url: `https://api.dicebear.com/7.x/${type}/svg?seed=${seed}&backgroundColor=${bg}`,
  pointsRequired: points
});

export const AVATAR_COLLECTION: Avatar[] = [
  // --- FAMÍLIA CARINHAS (Ref Imagem 1: Hand-drawn circles) ---
  createSquish('av-1', 'Helena', 0, 'micah', 'ffd5dc'),
  createSquish('av-2', 'Sorridente', 0, 'fun-emoji', 'd1f4d1'),
  createSquish('av-3', 'Azulito', 0, 'micah', 'b6e3f4'),
  createSquish('av-4', 'RosaPuff', 50, 'fun-emoji', 'fbcfe8'),
  createSquish('av-5', 'LaranjaDocinho', 75, 'micah', 'ffdfbf'),
  createSquish('av-6', 'VerdeEsperança', 100, 'fun-emoji', 'dcfce7'),

  // --- FAMÍLIA FORMAS (Ref Imagem 2: Geometric shapes with limbs) ---
  createSquish('av-7', 'QuadradoAzul', 150, 'shapes', 'e0f2fe'),
  createSquish('av-8', 'TrianguloAmarelo', 200, 'shapes', 'fef9c3'),
  createSquish('av-9', 'PentagonoRosa', 250, 'shapes', 'fdf2f8'),
  createSquish('av-10', 'EstrelaDourada', 300, 'shapes', 'fef3c7'),
  createSquish('av-11', 'CirculoVerde', 400, 'shapes', 'f0fdf4'),
  createSquish('av-12', 'HexagonoRoxo', 500, 'shapes', 'f5f3ff'),

  // --- FAMÍLIA MONSTROS FOFOS (Ref Imagem 4: Sketchy Monsters) ---
  createSquish('av-13', 'Gloop', 600, 'bottts-neutral', 'ccfbf1'),
  createSquish('av-14', 'Zorch', 700, 'bottts-neutral', 'fee2e2'),
  createSquish('av-15', 'Bloop', 800, 'bottts-neutral', 'dcfce7'),
  createSquish('av-16', 'FuzzBall', 900, 'lorelei', 'fbcfe8'),
  createSquish('av-17', 'MonsterPuff', 1000, 'lorelei', 'e0f2fe'),
  createSquish('av-18', 'AmiDino', 1250, 'lorelei', 'dcfce7'),

  // --- FAMÍLIA AVENTURA (Ref Imagem 3: 3D-ish characters) ---
  createSquish('av-19', 'Exploradora', 1500, 'adventurer', 'ede9fe'),
  createSquish('av-20', 'SuperHelena', 1750, 'adventurer', 'e0e7ff'),
  createSquish('av-21', 'MestraEstrela', 2000, 'adventurer', 'ffedd5'),
  createSquish('av-22', 'RobotAmigo', 2250, 'bottts', 'ecfdf5'),
  createSquish('av-23', 'CiberPuff', 2500, 'bottts', 'fdf2f8'),
  createSquish('av-24', 'PixelHelena', 3000, 'pixel-art', 'f0fdf4'),

  // --- NÍVEIS LENDÁRIOS (Extra) ---
  createSquish('av-25', 'ReinhaMagica', 5000, 'lorelei', 'fdf4ff'),
  createSquish('av-26', 'DragaoEstrela', 7500, 'bottts', '1e1b4b'),
  createSquish('av-27', 'UnicornioPuff', 10000, 'lorelei', 'fff1f2'),
  createSquish('av-28', 'Infinito', 25000, 'shapes', '171717'),
];
