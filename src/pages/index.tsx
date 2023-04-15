// src/pages/index.tsx
import React from 'react';
import CategoryCard from '../components/CategoryCard/CategoryCard';
import { MenuItem, FormControl, Select, InputLabel, SelectChangeEvent, TextField, Input } from '@mui/material';
import { useState } from 'react';
import { Container, Grid } from '@mui/material';
import { styled } from '@mui/system';
import { getCategories } from './api/index';
import { Category, GameMode, Question } from '@/types';
import { GameStateContext } from '@/contexts/GameStateContext';
import { useRouter } from 'next/router';
import { saveToLocalStorage, loadFromLocalStorage } from "@/utils/localStorage";
import HomeIcon from '@mui/icons-material/Home';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QuizIcon from '@mui/icons-material/Quiz';
import { Box } from '@mui/material';
import { Typography } from '@mui/material';
// import '../styles/globals.css';

const RootContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
}));

const Index: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadedFromCache, setLoadedFromCache] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  React.useEffect(() => {
    async function fetchCategories() {
      const cachedCategories = loadFromLocalStorage("categories");
      try {
        if (cachedCategories) {
          console.log("Loaded categories from local storage")
          console.log(cachedCategories)
          setCategories(cachedCategories);
          setLoadedFromCache(true);
          setLoading(false);
        } else {
          setLoading(true);
          const fetchedCategories = await getCategories();
          setLoading(false);
          setCategories(fetchedCategories);
          console.log(fetchedCategories)
          saveToLocalStorage("categories", fetchedCategories);
          setLoadedFromCache(false);
        }
      } catch (error) {
        setLoading(false);
        setError(true);
        let updatedErrorMessages = [error.message];
        setErrorMessages(updatedErrorMessages);
        console.error(error);
      }
    }

    fetchCategories();
  }, []);

  const { startGame, setState, nextQuestion } = React.useContext(GameStateContext);
  const router = useRouter();

  // Added player names and sameQuestion state
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [sameQuestion, setSameQuestion] = useState(false);

  // Handle submit for player names and same/different questions setting
  const handleSubmit = (e) => {
    e.preventDefault();
    router.push({
      pathname: "/question",
      query: { player1, player2, sameQuestion },
    });
  };

  const [gameMode, setGameMode] = useState<"infinite" | "timed" | "unlimited" | "preset">("unlimited");
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
  const [sameOrDifferent, setSameOrDifferentState] = useState<"same" | "different">("same");
  const [showSummary, setShowSummary] = useState(false);

  const handleCategoryClick = (category: Category) => {
    startGame(category, gameMode);
    setState((prevState) => ({ ...prevState, gameOver: false, sameQuestion: sameOrDifferent === "same" }));
    setShowSummary(false);
    router.push({
      pathname: '/question',
      query: { player1, player2, sameQuestion: sameOrDifferent === "same" },
    });
  };

  const handleGameModeChange = (event: SelectChangeEvent<"unlimited" | "timed" | "preset" | "infinite">) => {
    setGameMode(event.target.value as "unlimited" | "timed" | "preset" | "infinite");
  };

  const handleNumberOfQuestionsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNumberOfQuestions(parseInt(event.target.value, 10));
  };

  const handleSameOrDifferentChange = (
    event: SelectChangeEvent<"same" | "different">
  ) => {
    setSameOrDifferentState(event.target.value as "same" | "different");
  };

  return (
    <RootContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Typography variant="h1">CoupleConvo</Typography>
        <Typography variant="h5">The ultimate conversation starter game for couples</Typography>
      </Box>

      <hr />

      <FormControl fullWidth sx={{ mt: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>To get started - enter your names below and select a category:</Typography>
        <Box>
          <TextField
            id="player1"
            type="text"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            fullWidth
            label="Player 1 Name"
            sx={{ mb: 2 }}
          />
        </Box>
        <Box>
          <TextField
            id="player2"
            type="text"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            fullWidth
            label="Player 2 Name"
          />
        </Box>
      </FormControl>
      <br /><br />
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <HomeIcon titleAccess="Home" />
        <PlayArrowIcon titleAccess="Play" />
        <QuizIcon titleAccess="Quiz" />
      </Box>
      <FormControl fullWidth>
        <InputLabel id="game-mode-label">Game Mode</InputLabel>
        <Select
          labelId="game-mode-label"
          id="game-mode-select"
          value={gameMode}
          label="Game Mode"
          onChange={handleGameModeChange}
        >
          <MenuItem value="unlimited">Unlimited</MenuItem>
          <MenuItem value="timed">Timed</MenuItem>
          <MenuItem value="preset">Preset Number of Questions</MenuItem>
          <MenuItem value="infinite">Infinite</MenuItem>
        </Select>
      </FormControl>

      <br />

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Questions</InputLabel>
        <Select
          value={sameOrDifferent}
          onChange={handleSameOrDifferentChange}
        >
          <MenuItem value="same">Same</MenuItem>
          <MenuItem value="different">Different</MenuItem>
        </Select>
      </FormControl>


      {gameMode === "preset" && (
        <TextField
          fullWidth
          type="number"
          label="Number of Questions"
          value={numberOfQuestions}
          onChange={handleNumberOfQuestionsChange}
          InputProps={{
            inputProps: {
              min: 1,
            },
          }}
        />
      )}

      {showSummary && (
        <div>
          <h2>Game Summary</h2>
          {/* Display game summary here */}
        </div>
      )}

      <br />
      <br />


      <Grid container spacing={4}>
        {!categories.length && !error && loading && (
          <Grid item xs={12}>
            <Typography variant="h4">Loading...</Typography>
          </Grid>
        )}

        {!categories.length && !loading && (
          <Grid item xs={12}>
            <Typography variant="h4">No categories found</Typography>
          </Grid>
        )}

        {error && (
          <Grid item xs={12}>
            <Typography variant="h4">Error</Typography>
            <ul>
              {errorMessages.length > 0 && errorMessages.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          </Grid>
        )}

        {categories && categories.map((category: Category) => (
          <Grid item key={category.id} xs={12} sm={6} md={4}>
            <CategoryCard category={category} onClick={handleCategoryClick} />
          </Grid>
        ))}

      </Grid>
    </RootContainer>
  );
};

export default Index;
