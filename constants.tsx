
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

// Gerador de Monstros Amigáveis (Seeds otimizados para parecerem monstros divertidos)
const createAvatar = (id: string, name: string, seed: string, points: number, bgColor: string) => ({
  id,
  name,
  url: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}&backgroundColor=${bgColor.replace('#','')}&eyes=eyes12,eyes15,eyes19&mouth=mouth01,mouth05,mouth10`,
  pointsRequired: points
});

export const AVATAR_COLLECTION: Avatar[] = [
  createAvatar('mon-1', 'Ciclope Azul', 'Buster', 0, '3498DB'),
  createAvatar('fem-1', 'Rosinha', 'Mimi', 0, 'FF69B4'),
  createAvatar('mon-2', 'Verdinho', 'Toby', 0, '2ECC71'),
  createAvatar('fem-2', 'Lilás', 'Lulu', 0, '9B59B6'),
  createAvatar('mon-3', 'Amarelinho', 'Milo', 0, 'F1C40F'),
  createAvatar('fem-3', 'Turquesa', 'Daisy', 0, '1ABC9C'),
  
  // Desbloqueáveis
  createAvatar('fem-4', 'Super Monstra', 'Sasha', 50, 'FF1493'),
  createAvatar('mon-7', 'Giga-Byte', 'Snooky', 200, '8E44AD'),
  createAvatar('fem-7', 'Estelar', 'Stella', 500, '2C3E50'),
  createAvatar('mon-18', 'Rei Monstro', 'Legend', 1000, 'FF4500'),
];
