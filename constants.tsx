
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

// Gerador de Avatares inspirado na referência de monstros
const createMonster = (id: string, seed: string, points: number, style: string = 'big-smile', bg: string = 'b6e3f4') => ({
  id,
  url: `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=${bg}&mouth=openedSmile,unimpressed,teethSmile`,
  pointsRequired: points
});

export const AVATAR_COLLECTION: Avatar[] = [
  // --- GRUPO 1: MONSTROS SORRIDENTES (Básicos) ---
  createMonster('av-1', 'Bluey', 0, 'big-smile', 'b6e3f4'), // O monstro azul da referência
  createMonster('av-2', 'Grinner', 0, 'big-smile', 'dcfce7'),
  createMonster('av-3', 'Pinky', 0, 'big-smile', 'fdf2f8'),
  createMonster('av-4', 'Orange', 50, 'big-smile', 'ffedd5'),
  createMonster('av-5', 'Purple', 75, 'big-smile', 'f5f3ff'),
  createMonster('av-6', 'Yellow', 100, 'big-smile', 'fef9c3'),

  // --- GRUPO 2: FORMAS GEOMÉTRICAS (Ref Imagem 2) ---
  createMonster('av-7', 'Square', 150, 'shapes', 'e0f2fe'),
  createMonster('av-8', 'Tri', 200, 'shapes', 'fef9c3'),
  createMonster('av-9', 'Hexa', 250, 'shapes', 'fdf2f8'),
  createMonster('av-10', 'Star', 300, 'shapes', 'fef3c7'),
  createMonster('av-11', 'Roundy', 400, 'shapes', 'f0fdf4'),
  createMonster('av-12', 'Diamond', 500, 'shapes', 'e0e7ff'),

  // --- GRUPO 3: ROBÔS E MONSTROS TECH (Complexos) ---
  createMonster('av-13', 'Zog', 600, 'bottts-neutral', 'ccfbf1'),
  createMonster('av-14', 'Bip', 700, 'bottts-neutral', 'fee2e2'),
  createMonster('av-15', 'Glitch', 800, 'bottts-neutral', 'dcfce7'),
  createMonster('av-16', 'Bloop', 900, 'bottts-neutral', 'fbcfe8'),
  createMonster('av-17', 'Sparky', 1000, 'bottts', 'e0f2fe'),
  createMonster('av-18', 'Volt', 1200, 'bottts', 'dcfce7'),

  // --- GRUPO 4: MONSTROS PELUDOS (Ref Imagem 4) ---
  createMonster('av-19', 'Fuzz', 1400, 'lorelei', 'fef3c7'),
  createMonster('av-20', 'Munch', 1600, 'lorelei', 'fce7f3'),
  createMonster('av-21', 'Zorch', 1800, 'lorelei', 'dcfce7'),
  createMonster('av-22', 'Gloop', 2000, 'lorelei', 'e0f2fe'),
  createMonster('av-23', 'Wink', 2200, 'lorelei', 'f5f3ff'),
  createMonster('av-24', 'Rawr', 2500, 'lorelei', 'ffedd5'),

  // --- GRUPO 5: HERÓIS LENDÁRIOS (Ref Imagem 3) ---
  createMonster('av-25', 'HelenaDash', 3000, 'adventurer', 'fdf4ff'),
  createMonster('av-26', 'StarHunter', 4000, 'adventurer', '1e1b4b'),
  createMonster('av-27', 'SuperMunch', 5000, 'adventurer', 'fff1f2'),
  createMonster('av-28', 'GalaxyKing', 7500, 'bottts', '171717'),
  createMonster('av-29', 'InfiniteSmile', 10000, 'big-smile', 'ffd700'),
  createMonster('av-30', 'EstrelaSuprema', 25000, 'shapes', '000000'),
];
