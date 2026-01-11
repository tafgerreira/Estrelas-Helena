
import React from 'react';
import { BookOpen, Calculator, Globe, GraduationCap } from 'lucide-react';
import { Subject } from './types';

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
  }
};

export const INITIAL_PRIZES = [
  { id: '1', name: 'Gelado Especial', cost: 5, image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?q=80&w=400&h=400&auto=format&fit=crop', unlocked: false },
  { id: '2', name: '30 min de Videojogos', cost: 10, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&h=400&auto=format&fit=crop', unlocked: false },
  { id: '3', name: 'Cinema em Família', cost: 25, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=400&h=400&auto=format&fit=crop', unlocked: false },
  { id: '4', name: 'Brinquedo Novo', cost: 50, image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=400&h=400&auto=format&fit=crop', unlocked: false }
];
