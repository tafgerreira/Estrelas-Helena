
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

// Gerador de Monstros baseado na imagem de referência
const createMonster = (id: string, name: string, seed: string, points: number, bgColor: string) => ({
  id,
  name,
  url: `https://api.dicebear.com/7.x/big-smile/svg?seed=${seed}&backgroundColor=${bgColor.replace('#','')}`,
  pointsRequired: points
});

export const AVATAR_COLLECTION: Avatar[] = [
  // OS 4 MONSTROS DA IMAGEM DE REFERÊNCIA
  createMonster('mon-1', 'Três Olhos', 'Buster', 0, 'FF8C00'),    // Laranja (Referência 1)
  createMonster('mon-2', 'Verdinho', 'Toby', 0, '2ECC71'),       // Verde (Referência 2)
  createMonster('mon-3', 'Polvinho', 'Milo', 0, 'F1C40F'),       // Amarelo (Referência 3)
  createMonster('mon-4', 'Peludo Azul', 'Oliver', 0, '3498DB'),   // Azul (Referência 4)
  
  // NOVOS AMIGOS SEMELHANTES (Tier 1 - 50 a 200 pontos)
  createMonster('mon-5', 'Rosa choque', 'Luna', 50, 'FF69B4'),
  createMonster('mon-6', 'Ciclope Vermelho', 'Casper', 100, 'E74C3C'),
  createMonster('mon-7', 'Roxinho Alegre', 'Snooky', 150, '9B59B6'),
  createMonster('mon-8', 'Cinzento Mistério', 'Mist', 200, '95A5A6'),
  
  // MONSTROS RAROS (Tier 2 - 300 a 800 pontos)
  createMonster('mon-9', 'Dentes de Sabre', 'Zilla', 300, 'D35400'),
  createMonster('mon-10', 'Faísca', 'Spark', 400, 'F39C12'),
  createMonster('mon-11', 'Grande Sorriso', 'Smiley', 500, '1ABC9C'),
  createMonster('mon-12', 'Olhar de Estrela', 'Starry', 600, '2C3E50'),
  createMonster('mon-13', 'Gominha', 'Gummy', 700, 'FF00FF'),
  createMonster('mon-14', 'Dracozinho', 'Draco', 800, '27AE60'),

  // MONSTROS LENDÁRIOS (Tier 3 - +1000 pontos)
  createMonster('mon-15', 'Fofura Extrema', 'Fluff', 1000, 'ECF0F1'),
  createMonster('mon-16', 'Rei Monstro', 'King', 1500, 'FFD700'),
  createMonster('mon-17', 'Sombra Mágica', 'Shadow', 2000, '000000'),
  createMonster('mon-18', 'A Lenda Viva', 'Legend', 5000, '6366f1'),
];
