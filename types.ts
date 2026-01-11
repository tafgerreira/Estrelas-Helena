
export enum Subject {
  PORTUGUESE = 'Português',
  MATH = 'Matemática',
  NSS = 'Estudo do Meio',
  ENGLISH = 'Inglês'
}

export interface SubjectMetrics {
  totalMinutes: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'text' | 'word-ordering';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  complexity: number; // 1 (0.50€) a 5 (2.50€)
  translation?: string;
}

export interface Worksheet {
  id: string;
  subject: Subject;
  images: string[];
  name: string;
  date: string;
}

export interface Prize {
  id: string;
  name: string;
  cost: number;
  image: string;
  unlocked: boolean;
}

export interface WonPrize extends Prize {
  dateWon: string;
}

export interface UserStats {
  credits: number;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  dailyMinutes: number;
  wonHistory: WonPrize[];
  subjectStats: Record<Subject, SubjectMetrics>;
  recentWorksheetIds: string[];
  doubleCreditDays: number[];
}
