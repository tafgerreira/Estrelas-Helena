
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

export const AVATAR_COLLECTION: Avatar[] = [
  // Grátis iniciais
  { id: 'av-1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Helena', pointsRequired: 0 },
  { id: 'av-2', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Mimi', pointsRequired: 0 },
  
  // Nível Bronze (100-500 pontos)
  { id: 'av-3', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Happy', pointsRequired: 100 },
  { id: 'av-4', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Robo1', pointsRequired: 150 },
  { id: 'av-5', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna', pointsRequired: 250 },
  { id: 'av-6', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Sun', pointsRequired: 300 },
  { id: 'av-7', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bluey', pointsRequired: 400 },
  { id: 'av-8', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe', pointsRequired: 500 },

  // Nível Prata (750-1500 pontos)
  { id: 'av-9', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Star', pointsRequired: 750 },
  { id: 'av-10', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky', pointsRequired: 850 },
  { id: 'av-11', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo', pointsRequired: 1000 },
  { id: 'av-12', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Lolly', pointsRequired: 1250 },
  { id: 'av-13', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Iron', pointsRequired: 1500 },

  // Nível Ouro (2000-5000 pontos)
  { id: 'av-14', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix', pointsRequired: 2000 },
  { id: 'av-15', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Hero', pointsRequired: 2500 },
  { id: 'av-16', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ultra', pointsRequired: 3000 },
  { id: 'av-17', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jade', pointsRequired: 4000 },
  { id: 'av-18', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Magic', pointsRequired: 5000 },
  { id: 'av-19', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Giga', pointsRequired: 7500 },
  { id: 'av-20', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Legend', pointsRequired: 10000 },
];
