// src/contexts/GameStateContext.tsx
import React, { createContext, useState } from 'react';
import { GameState, Category, GameMode, Question } from '@/types';
import { getCategories } from "@/utils/categories";
import { getQuestionsByCategory } from "@/pages/api";
import { saveToLocalStorage, loadFromLocalStorage } from "@/utils/localStorage";

interface GameStateContextType {
    state: GameState;
    setState: React.Dispatch<React.SetStateAction<GameState>>;
    startGame: (category: Category, gameMode: GameMode) => void;
    nextQuestion: () => void;
    endGame: () => void;
    resetGame: () => void;
    showGameSummary: () => void;
}

const initialState: GameState = {
    currentCategory: null,
    currentQuestion: null,
    gameMode: 'unlimited',
    sameOrDifferent: 'same',
    currentQuestionIndex: 0,
    numberOfQuestions: null,
    gameOver: false,
    showSummary: false,
    categories: [],
    questions: [],
};

export const GameStateContext = createContext<GameStateContextType>({} as GameStateContextType);

interface GameStateProviderProps {
    children: React.ReactNode;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({ children }) => {
    const [state, setState] = useState<GameState>(initialState);

    React.useEffect(() => {
        if (state.currentCategory && state.currentQuestionIndex < state.questions.length) {
            setState((prevState) => ({
                ...prevState,
                currentQuestion: state.questions[state.currentQuestionIndex],
            }));
        } else if (state.currentQuestionIndex >= state.questions.length) {
            setState((prevState) => ({ ...prevState, gameOver: true }));
        }
    }, [state.currentCategory, state.currentQuestionIndex, state.questions]);

    const startGame = async (category: Category, gameMode: GameMode) => {
        const categoryQuestionsKey = `questions_${category.id}`;
        let fetchedQuestions = loadFromLocalStorage(categoryQuestionsKey);

        if (!fetchedQuestions || fetchedQuestions.length === 0) {
            const response = await getQuestionsByCategory(category.name);
            fetchedQuestions = response;
            saveToLocalStorage(categoryQuestionsKey, fetchedQuestions);
        }

        // Shuffle the questions
        const shuffledQuestions = fetchedQuestions.sort(() => 0.5 - Math.random());

        setState((prevState) => ({
            ...prevState,
            currentCategory: category,
            gameMode,
            currentQuestionIndex: 0,
            questions: shuffledQuestions,
            numberOfQuestions: fetchedQuestions.length,
        }));
    };

    const nextQuestion = () => {
        setState((prevState) => {
            const nextQuestionIndex = prevState.currentQuestionIndex + 1;
            return {
                ...prevState,
                currentQuestionIndex: nextQuestionIndex,
                currentQuestion: prevState.questions[nextQuestionIndex],
            };
        });
    };


    const endGame = async () => {
        setState({ ...state, gameOver: true, questions: [], currentCategory: null });
    };

    const resetGame = () => {
        setState(initialState);
    };

    const showGameSummary = () => {
        setState({ ...state, showSummary: true });
    };

    return (
        <GameStateContext.Provider value={{ state, setState, startGame, nextQuestion, endGame, resetGame, showGameSummary }}>
            {children}
        </GameStateContext.Provider>
    );
};
