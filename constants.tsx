
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

// Gerador de Monstros e Monstrinhas
const createAvatar = (id: string, name: string, seed: string, points: number, bgColor: string) => ({
  id,
  name,
  url: `https://api.dicebear.com/7.x/big-smile/svg?seed=${seed}&backgroundColor=${bgColor.replace('#','')}`,
  pointsRequired: points
});

export const AVATAR_COLLECTION: Avatar[] = [
  // EQUIPA INICIAL DA HELENA (Mix de Monstros e Monstrinhas)
  createAvatar('mon-1', 'Três Olhos', 'Buster', 0, 'FF8C00'),    // Laranja Original
  createAvatar('fem-1', 'Estrela Rosa', 'Mimi', 0, 'FF69B4'),   // Nova Monstrinha Rosa
  createAvatar('mon-2', 'Verdinho', 'Toby', 0, '2ECC71'),       // Verde Original
  createAvatar('fem-2', 'Lilás Mágica', 'Lulu', 0, '9B59B6'),   // Nova Monstrinha Lilás
  createAvatar('mon-3', 'Polvinho', 'Milo', 0, 'F1C40F'),       // Amarelo Original
  createAvatar('fem-3', 'Menta Doce', 'Daisy', 0, '1ABC9C'),    // Nova Monstrinha Menta
  createAvatar('mon-4', 'Peludo Azul', 'Oliver', 0, '3498DB'),   // Azul Original

  // NOVAS AMIGAS PARA DESBLOQUEAR (Tier 1 - 50 a 200 pontos)
  createAvatar('fem-4', 'Princesa Monstro', 'Sasha', 50, 'FF1493'),
  createAvatar('fem-5', 'Corações', 'Candy', 100, 'FFB6C1'),
  createAvatar('fem-6', 'Fada da Floresta', 'Flora', 150, 'A7D08C'),
  createAvatar('mon-7', 'Roxinho Alegre', 'Snooky', 200, '8E44AD'),
  
  // MONSTROS E MONSTRINHAS RAROS (Tier 2 - 300 a 800 pontos)
  createAvatar('fem-7', 'Brilho Estelar', 'Stella', 300, '2C3E50'),
  createAvatar('fem-8', 'Arco-Íris', 'Iris', 400, '6366f1'),
  createAvatar('mon-10', 'Faísca', 'Spark', 500, 'F39C12'),
  createAvatar('fem-9', 'Dourada Real', 'Goldie', 800, 'FFD700'),

  // LENDÁRIOS (+1000 pontos)
  createAvatar('fem-10', 'Rainha das Estrelas', 'Galaxia', 1500, '4B0082'),
  createAvatar('mon-17', 'Sombra Mágica', 'Shadow', 2000, '000000'),
  createAvatar('mon-18', 'A Lenda Viva', 'Legend', 5000, 'FF4500'),
];
