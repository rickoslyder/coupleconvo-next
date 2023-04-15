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
    const { state, setState, nextQuestion, endGame, resetGame, showGameSummary } = React.useContext(GameStateContext);
    const [timeRemaining, setTimeRemaining] = React.useState<number>(10);
    const { currentQuestion, currentQuestionIndex, gameMode, sameOrDifferent, questions, numberOfQuestions } = state;
    const router = useRouter();

    const { player1, player2, sameQuestion } = router.query;
    const [currentPlayer, setCurrentPlayer] = React.useState(player1);

    React.useEffect(() => {
        if (sameQuestion === 'true') {
            setState((prev) => ({ ...prev, sameOrDifferent: 'same' }));
        } else {
            setState((prev) => ({ ...prev, sameOrDifferent: 'different' }));
        }
    }, [sameQuestion, setState]);

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

    const handleNextQuestion = () => {
        if (sameOrDifferent !== "same") {
            nextQuestion();
            return;
        }
        if (player1 && player2) {
            if (currentPlayer === player1) {
                setCurrentPlayer(player2);
            } else {
                setCurrentPlayer(player1);
                nextQuestion();
            }
        }
    };

    console.log(state)
    console.log(currentQuestion)

    return (
        <RootContainer maxWidth="sm">
            <Typography variant="h4" sx={{ mb: 3 }}><center>{currentPlayer}</center></Typography>
            <ProgressIndicator current={currentQuestionIndex + 1} total={numberOfQuestions} />
            <QuestionCard question={currentQuestion?.text || null} />
            <ModeIndicatorWrapper container spacing={2}>
                <Grid container item spacing={2} xs={12}>
                    <Grid item xs={12}>
                        <strong>{state.currentCategory?.name}</strong>
                    </Grid>
                    <Grid item xs={12}>
                        {gameMode === 'timed' ? 'Timed Mode' : 'Unlimited Mode'}
                        <br />
                        {sameOrDifferent === 'same' ? 'Same Questions' : 'Different Questions'}
                    </Grid>
                </Grid>
                {gameMode === 'timed' && (
                    <Grid item>
                        <CircularProgressWithLabel value={timeRemaining * 10} />
                    </Grid>
                )}
            </ModeIndicatorWrapper>
            <Box mt={2}>
                <Button onClick={handleNextQuestion} variant="contained" color="primary" sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#81c784' } }}>Next</Button>
                {" "}
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={async () => {
                        resetGame();
                        showGameSummary();
                        router.push("/");
                    }}
                    sx={{ backgroundColor: '#f44336', '&:hover': { backgroundColor: '#e57373' } }}
                >
                    End Game
                </Button>

            </Box>
        </RootContainer>
    );
};

export default Question;
