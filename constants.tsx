
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

// Gerador de Monstros baseado na imagem de referência do utilizador
// Usamos seeds específicas no estilo 'big-smile' que geram formas orgânicas e coloridas
const createMonster = (id: string, seed: string, points: number, bgColor: string) => ({
  id,
  url: `https://api.dicebear.com/7.x/big-smile/svg?seed=${seed}&backgroundColor=${bgColor.replace('#','')}`,
  pointsRequired: points
});

export const AVATAR_COLLECTION: Avatar[] = [
  // Monstros Amarelos/Laranja (Iniciais)
  createMonster('av-1', 'Buster', 0, 'FFD700'), // Amarelo 3 olhos
  createMonster('av-2', 'Toby', 0, 'FF8C00'),   // Laranja com chifres
  createMonster('av-3', 'Milo', 0, 'fdf2f8'),   // Rosa pontos brancos
  
  // Monstros Coloridos (Tier 1)
  createMonster('av-4', 'Casper', 50, 'FF5733'), // Vermelho Ciclope
  createMonster('av-5', 'Luna', 100, '2ECC71'),  // Verde chifres
  createMonster('av-6', 'Oliver', 150, '3498DB'), // Azul riscas
  createMonster('av-7', 'Bella', 200, 'F1C40F'),  // Amarelo 6 olhos
  createMonster('av-8', 'Jasper', 250, '1ABC9C'), // Verde bigode

  // Monstros Raros (Tier 2)
  createMonster('av-9', 'Snooky', 300, '9B59B6'), 
  createMonster('av-10', 'Zilla', 400, 'E67E22'),
  createMonster('av-11', 'Grumpy', 500, '34495E'),
  createMonster('av-12', 'Spark', 600, 'E74C3C'),
  createMonster('av-13', 'Glow', 700, 'F39C12'),
  createMonster('av-14', 'Mist', 800, 'BDC3C7'),
  createMonster('av-15', 'Fluff', 1000, 'D35400'),
  createMonster('av-16', 'Shadow', 1500, '2C3E50'),
  createMonster('av-17', 'Goldie', 2000, 'FFD700'),
  createMonster('av-18', 'Legend', 5000, '000000'),
];
