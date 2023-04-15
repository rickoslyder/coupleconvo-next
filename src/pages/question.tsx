// src/pages/question.tsx
import * as React from 'react';
import { GameStateContext } from '@/contexts/GameStateContext';
import { QuestionCard } from '@/components/QuestionCard/QuestionCard';
import { Button, Container } from '@mui/material';
import { styled } from '@mui/system';
import { useRouter } from 'next/router';
import ProgressIndicator from '../components/ProgressIndicator/ProgressIndicator';

// import '../styles/globals.css';

const RootContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
}));

const ModeIndicator = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

const Question: React.FC = () => {
    const { state, nextQuestion, endGame, showGameSummary } = React.useContext(GameStateContext);
    const { currentQuestion, currentQuestionIndex, gameMode, sameOrDifferent, questions, numberOfQuestions } = state;
    const router = useRouter();

    React.useEffect(() => {
        if (!currentQuestion) {
            nextQuestion();
        }
    }, []);

    React.useEffect(() => {
        if (gameMode === 'timed') {
            const timer = setTimeout(() => {
                nextQuestion();
            }, 10000); // Adjust the time (in milliseconds) as needed

            return () => {
                clearTimeout(timer);
            };
        }
    }, [currentQuestion, gameMode, nextQuestion]);

    return (
        <RootContainer maxWidth="sm">
            <ProgressIndicator current={numberOfQuestions - questions.length} total={numberOfQuestions} />
            <QuestionCard question={currentQuestion?.text || null} />
            <ModeIndicator>
                {gameMode === 'timed' ? <p>Timed Mode</p> : <p>Unlimited Mode</p>}
                {sameOrDifferent === 'same' ? <p>Same Questions</p> : <p>Different Questions</p>}
            </ModeIndicator>
            <Button onClick={nextQuestion} variant="contained" color="primary">Next</Button>
            {" "}
            <Button
                variant="contained"
                color="secondary"
                onClick={async () => {
                    await endGame();
                    showGameSummary();
                    router.push("/");
                }}
            >
                End Game
            </Button>
        </RootContainer>
    );
};

export default Question;
