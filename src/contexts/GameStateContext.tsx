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

    const startGame = (
        category: Category,
        gameMode: GameMode
    ) => {
        setState((prevState) => ({
            ...prevState,
            currentCategory: category,
            gameMode,
            sameOrDifferent: prevState.sameOrDifferent,
            gameOver: false,
            showSummary: false,
        }));
        nextQuestion();
    };


    const nextQuestion = async () => {
        if (!state.currentCategory) {
            return;
        }

        const categoryQuestionsKey = `questions_${state.currentCategory.id}`;
        let fetchedQuestions = state.questions.length > 1
            ? state.questions
            : loadFromLocalStorage(categoryQuestionsKey);

        if (!fetchedQuestions || fetchedQuestions.length === 0) {
            const response = await getQuestionsByCategory(state.currentCategory.name);
            fetchedQuestions = response.questions;
            saveToLocalStorage(categoryQuestionsKey, fetchedQuestions);
        }

        if (fetchedQuestions && fetchedQuestions.length > 0) {
            const questionList = fetchedQuestions.sort(() => 0.5 - Math.random());

            console.log("questionList", questionList);

            setState((prevState) => {
                const [currentQuestion, ...remainingQuestions] = questionList;

                console.log("currentQuestion", currentQuestion);
                console.log("remainingQuestions", remainingQuestions);
                console.log("fetchedQuestions", fetchedQuestions);

                return {
                    ...prevState,
                    currentQuestion,
                    questions: remainingQuestions,
                    numberOfQuestions: state.currentCategory.questions.length,
                };
            });
        } else {
            console.error("No questions found for the selected category.");
        }
    };


    const endGame = async () => {
        setState({ ...state, gameOver: true, questions: [], currentCategory: null });
    };

    const showGameSummary = () => {
        setState({ ...state, showSummary: true });
    };

    return (
        <GameStateContext.Provider value={{ state, setState, startGame, nextQuestion, endGame, showGameSummary }}>
            {children}
        </GameStateContext.Provider>
    );
};
