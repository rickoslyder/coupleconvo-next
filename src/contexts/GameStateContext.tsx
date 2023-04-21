// src/contexts/GameStateContext.tsx
import React, { createContext, useState } from 'react';
import { GameState, Category, GameMode, HowMany, Question } from '@/types';
import { getCategories, getQuestionsByCategory } from "@/pages/api";
import { saveToLocalStorage, loadFromLocalStorage } from "@/utils/localStorage";

interface GameStateContextType {
    state: GameState;
    setState: React.Dispatch<React.SetStateAction<GameState>>;
    startGame: (category: Category, gameMode: GameMode, howMany: HowMany, presetNumberOfQuestions: number, timePerRound: number) => void;
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
    howMany: null,
    timePerRound: null,
    gameOver: false,
    showSummary: false,
    categories: [],
    questions: [],
    fetchingQuestions: false,
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

    const startGame = async (category: Category, gameMode: GameMode, howMany: HowMany, presetNumberOfQuestions: number, timePerRound: number) => {
        if (category.name === 'Random') {
            setState((prevState) => ({ ...prevState, fetchingQuestions: true }));
            const allCategories = await getCategories();
            let allQuestions: Question[] = [];

            for (const cat of allCategories) {
                const categoryQuestionsKey = `questions_${cat.id}`;
                let fetchedQuestions = loadFromLocalStorage(categoryQuestionsKey);

                if (!fetchedQuestions || fetchedQuestions.length === 0) {
                    const response = await getQuestionsByCategory(cat.name);
                    fetchedQuestions = response;
                    saveToLocalStorage(categoryQuestionsKey, fetchedQuestions);
                }

                // Shuffle the questions and take the first 15 (or all if there are less than 15)
                // This is to prevent the same questions from being asked in the same game
                // Calculate fetch delta based on how many questions are needed
                let fetchDelta = howMany === 'preset' ? Math.max(1, presetNumberOfQuestions / allCategories.length) : 15;

                const shuffledQuestions = fetchedQuestions.sort(() => 0.5 - Math.random()).slice(0, fetchDelta);
                allQuestions = allQuestions.concat(shuffledQuestions);
            }

            // Shuffle all questions from all categories
            const shuffledAllQuestions = allQuestions.sort(() => 0.5 - Math.random());

            shuffledAllQuestions.length = howMany === 'preset' ? presetNumberOfQuestions : shuffledAllQuestions.length;

            setState((prevState) => ({
                ...prevState,
                currentCategory: category,
                gameMode,
                currentQuestionIndex: 0,
                questions: shuffledAllQuestions,
                numberOfQuestions: shuffledAllQuestions.length,
                fetchingQuestions: false,
                timePerRound,
            }));
        } else {
            setState((prevState) => ({ ...prevState, fetchingQuestions: true }));
            const categoryQuestionsKey = `questions_${category.id}`;
            let fetchedQuestions = loadFromLocalStorage(categoryQuestionsKey);

            if (!fetchedQuestions || fetchedQuestions.length === 0) {
                const response = await getQuestionsByCategory(category.name);
                fetchedQuestions = response;
                saveToLocalStorage(categoryQuestionsKey, fetchedQuestions);
            }

            // Shuffle the questions
            const shuffledQuestions = fetchedQuestions.sort(() => 0.5 - Math.random());
            shuffledQuestions.length = howMany === 'preset' ? presetNumberOfQuestions : shuffledQuestions.length;

            setState((prevState) => ({
                ...prevState,
                currentCategory: category,
                gameMode,
                currentQuestionIndex: 0,
                questions: shuffledQuestions,
                numberOfQuestions: fetchedQuestions.length,
                fetchingQuestions: false,
            }));
        };
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
