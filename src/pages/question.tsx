// src/pages/question.tsx
import * as React from 'react';
import { GameStateContext } from '@/contexts/GameStateContext';
import { QuestionCard } from '@/components/QuestionCard/QuestionCard';
import { Button, Container, Box, Typography, CircularProgress, Grid } from '@mui/material';
import { styled } from '@mui/system';
import { useRouter } from 'next/router';
import ProgressIndicator from '../components/ProgressIndicator/ProgressIndicator';

const CountdownTimer = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const ModeIndicatorWrapper = styled(Grid)(({ theme }) => ({
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

// import '../styles/globals.css';

const RootContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
}));

const ModeIndicator = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(2),
}));

const Question: React.FC = () => {
    const { state, nextQuestion, endGame, resetGame, showGameSummary } = React.useContext(GameStateContext);
    const [timeRemaining, setTimeRemaining] = React.useState<number>(10);
    const { currentQuestion, currentQuestionIndex, gameMode, sameOrDifferent, questions, numberOfQuestions } = state;
    const router = useRouter();

    React.useEffect(() => {
        if (gameMode === 'timed') {
            const timer = setTimeout(() => {
                setTimeRemaining((prevTime) => prevTime - 1);
                if (timeRemaining === 0) {
                    nextQuestion();
                    setTimeRemaining(10);
                }
            }, 1000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [gameMode, nextQuestion, timeRemaining]);

    React.useEffect(() => {
        if (!currentQuestion) {
            nextQuestion();
        }
    }, [currentQuestion, nextQuestion]);

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

    const CircularProgressWithLabel: React.FC<{ value: number }> = (props) => {
        return (
            <Box position="relative" display="inline-flex">
                <CircularProgress variant="determinate" {...props} />
                <Box
                    top={0}
                    left={0}
                    bottom={0}
                    right={0}
                    position="absolute"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Typography variant="caption" component="div" color="text.secondary">
                        {`${Math.round(props.value)}s`}
                    </Typography>
                </Box>
            </Box>
        );
    };

    return (
        <RootContainer maxWidth="sm">
            <ProgressIndicator current={currentQuestionIndex + 1} total={numberOfQuestions} />
            <QuestionCard question={currentQuestion?.text || null} />
            <ModeIndicatorWrapper container spacing={2}>
                <Grid item>
                    {gameMode === 'timed' ? 'Timed Mode' : 'Unlimited Mode'}
                </Grid>
                <Grid item>
                    {sameOrDifferent === 'same' ? 'Same Questions' : 'Different Questions'}
                </Grid>
                {gameMode === 'timed' && (
                    <Grid item>
                        <CircularProgressWithLabel value={timeRemaining * 10} />
                    </Grid>
                )}
            </ModeIndicatorWrapper>
            <Box mt={2}>
                <Button onClick={nextQuestion} variant="contained" color="primary">Next</Button>
                {" "}
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={async () => {
                        resetGame();
                        showGameSummary();
                        router.push("/");
                    }}
                >
                    End Game
                </Button>
            </Box>
        </RootContainer>
    );
};

export default Question;
