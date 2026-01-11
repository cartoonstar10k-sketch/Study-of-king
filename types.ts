
export enum Difficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
  EXPERT = 'Expert',
  MASTER = 'Master'
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: Difficulty;
  subject: string;
  language: string;
}

export interface UserStats {
  totalScore: number;
  level: number;
  xp: number;
  streak: number;
  unlockedSubjects: string[];
}

export interface GameState {
  currentQuestion: Question | null;
  score: number;
  questionsAnswered: number;
  isLoading: boolean;
  selectedSubject: string;
  selectedLanguage: string;
  currentDifficulty: Difficulty;
  isGameOver: boolean;
}
