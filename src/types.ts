// src/types.ts
export interface Category {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: string | number;
  text: string;
  category: string;
}

export enum GameModeEnum {
  Timed = "timed",
  Unlimited = "unlimited",
  Preset = "preset",
  Infinite = "infinite",
}

export type GameMode = "unlimited" | "timed";

export type HowMany = "preset" | "infinite";

export enum SameOrDifferent {
  Same = "same",
  Different = "different",
}

export interface GameState {
  currentCategory: Category | null;
  currentQuestion: Question | null;
  gameMode: "timed" | "unlimited";
  sameOrDifferent: "same" | "different";
  currentQuestionIndex: number;
  howMany: "preset" | "infinite";
  timePerRound: number | null | undefined;
  numberOfQuestions: number | null | undefined;
  gameOver: boolean;
  showSummary: boolean;
  categories: Category[];
  questions: Question[];
  fetchingQuestions: boolean;
}
