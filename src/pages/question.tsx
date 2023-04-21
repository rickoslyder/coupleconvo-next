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

const DEFAULT_TIME = 30;

const Question: React.FC = () => {
    const { state, setState, nextQuestion, endGame, resetGame, showGameSummary } = React.useContext(GameStateContext);
    const { currentQuestion, currentQuestionIndex, gameMode, sameOrDifferent, questions, numberOfQuestions, fetchingQuestions } = state;
    const router = useRouter();

    const { player1, player2, sameQuestion, timed } = router.query;
    const [currentPlayer, setCurrentPlayer] = React.useState(player1);

    let timeToUse = timed ?? DEFAULT_TIME
    const [timeRemaining, setTimeRemaining] = React.useState<number>(timeToUse);

    React.useEffect(() => {
        if (sameQuestion === 'true') {
            setState((prev) => ({ ...prev, sameOrDifferent: 'same' }));
        } else {
            setState((prev) => ({ ...prev, sameOrDifferent: 'different' }));
        }
    }, [sameQuestion, setState]);

    // React.useEffect(() => {
    //     if (timed) {
    //         setState((prev) => ({ ...prev, sameOrDifferent: 'same' }));
    //     } else {
    //         setState((prev) => ({ ...prev, sameOrDifferent: 'different' }));
    //     }
    // }, [timed, setState]);


    React.useEffect(() => {
        if (gameMode === 'timed') {
            const timer = setTimeout(() => {
                setTimeRemaining((prevTime) => prevTime - 1);
                if (timeRemaining === 0) {
                    nextQuestion();
                    setTimeRemaining(timeToUse);
                }
            }, 1000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [gameMode, nextQuestion, timeRemaining, timeToUse]);

    React.useEffect(() => {
        if (gameMode === 'timed') {
            const timer = setTimeout(() => {
                nextQuestion();
            }, timeToUse * 1000); // Adjust the time (in milliseconds) as needed

            return () => {
                clearTimeout(timer);
            };
        }
    }, [currentQuestion, gameMode, nextQuestion, timeToUse]);

    const CircularProgressWithLabel: React.FC<{ value: number }> = (props) => {
        return (
            <Box position="relative" display="inline-flex">
                <CircularProgress variant="determinate" value={Math.round((props.value / timeToUse) * 100)} />
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
            setCurrentPlayer(currentPlayer === player1 ? player2 : player1)
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

    return (
        <RootContainer maxWidth="sm">
            <Typography variant="h4" sx={{ mb: 3 }}><center>{currentPlayer}</center></Typography>
            <ProgressIndicator current={currentQuestionIndex + 1} total={numberOfQuestions} loading={fetchingQuestions} />
            <QuestionCard question={currentQuestion?.text || null} loading={fetchingQuestions} />
            <ModeIndicatorWrapper container spacing={2}>
                <Grid container item spacing={2} xs={12}>
                    <Grid item xs={12}>
                        <strong>{state.currentCategory?.name}</strong>
                    </Grid>
                    <Grid item xs={12}>
                        {gameMode === 'timed' ? 'Timed Mode' : 'Unlimited Mode'}
                        <Button onClick={() => setState((prevState) => ({ ...prevState, gameMode: gameMode === 'unlimited' ? 'timed' : 'unlimited' }))} variant='outlined' color='primary' size='small' sx={{ ml: 1 }}>Toggle</Button>
                        <br />
                        {sameOrDifferent === 'same' ? 'Same Questions' : 'Different Questions'}
                        <Button onClick={() => setState((prevState) => ({ ...prevState, sameOrDifferent: sameOrDifferent === 'same' ? 'different' : 'same' }))} variant='outlined' color='primary' size='small' sx={{ ml: 1 }}>Toggle</Button>
                    </Grid>
                </Grid>
                {gameMode === 'timed' && (
                    <Grid item
                        onClick={() => {
                            let newTime = prompt('Each round will last for this many seconds. Default is 30 seconds.', timeToUse);
                            if (newTime) {
                                setTimeRemaining(parseInt(newTime));
                                timeToUse = parseInt(newTime);
                            }
                        }}
                        sx={{ cursor: 'pointer' }}>
                        <CircularProgressWithLabel value={timeRemaining} />
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
