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
import { v4 as uuidv4 } from 'uuid';
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
        if (cachedCategories && cachedCategories.length > 0) {
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
  const [player1, setPlayer1] = useState(loadFromLocalStorage("player1_name") || "");
  const [player2, setPlayer2] = useState(loadFromLocalStorage("player2_name") || "");
  const [sameQuestion, setSameQuestion] = useState(false);

  const [gameMode, setGameMode] = useState<"timed" | "unlimited">("unlimited");
  const [howMany, setHowMany] = useState<"infinite" | "preset">("infinite");
  const [presetNumberOfQuestions, setPresetNumberOfQuestions] = useState<number>(10);
  const [sameOrDifferent, setSameOrDifferentState] = useState<"same" | "different">("same");
  const [timePerRound, setTimePerRound] = useState<number>(30);
  const [showSummary, setShowSummary] = useState(false);

  const handleCategoryClick = (category: Category) => {
    saveToLocalStorage("player1_name", player1);
    saveToLocalStorage("player2_name", player2);
    startGame(category, gameMode, howMany, presetNumberOfQuestions, timePerRound);
    setState((prevState) => ({ ...prevState, gameOver: false, sameQuestion: sameOrDifferent === "same" }));
    setShowSummary(false);
    router.push({
      pathname: '/question',
      query: { player1, player2, sameQuestion: sameOrDifferent === "same", timed: timePerRound },
    });
  };

  const handleGameModeChange = (event: SelectChangeEvent<"unlimited" | "timed">) => {
    setGameMode(event.target.value as "unlimited" | "timed");
  };

  const handleHowManyChange = (event: SelectChangeEvent<"infinite" | "preset">) => {
    setHowMany(event.target.value as "infinite" | "preset");
  };

  const handlePresetNumberOfQuestionsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPresetNumberOfQuestions(parseInt(event.target.value, 10));
  };

  const handleTimePerRoundChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTimePerRound(parseInt(event.target.value, 10));
  };

  const handleSameOrDifferentChange = (
    event: SelectChangeEvent<"same" | "different">
  ) => {
    setSameOrDifferentState(event.target.value as "same" | "different");
  };

  const randomCategory: Category = {
    id: uuidv4(),
    name: 'Random',
    description: 'A mix of questions from all categories.',
    questions: [],
  };

  console.log(categories)

  return (
    <RootContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Typography variant="h2">CoupleConvo</Typography>
        <Typography variant="h5">The ultimate conversation starter game for couples</Typography>
      </Box>

      <hr />

      <FormControl fullWidth sx={{ mt: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>To get started - enter your names below and select a category:</Typography>
        <Box>
          <TextField
            id="player1"
            type="text"
            defaultValue={""}
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
            fullWidth
            label="Player 1 Name"
            sx={{ mb: 2 }}
            focused
            variant='standard'
          />
        </Box>
        <Box>
          <TextField
            id="player2"
            type="text"
            defaultValue={""}
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
            fullWidth
            label="Player 2 Name"
            variant='standard'
            focused
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
          <MenuItem value="unlimited">Unlimited Mode</MenuItem>
          <MenuItem value="timed">Timed Mode</MenuItem>
        </Select>
      </FormControl>

      {gameMode === "timed" && (
        <TextField
          fullWidth
          sx={{ mt: 2 }}
          type="number"
          label="Time per Round (seconds)"
          value={timePerRound}
          onChange={handleTimePerRoundChange}
          InputProps={{
            inputProps: {
              min: 1,
            },
          }}
        />
      )}

      <br />

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel id="game-mode-label">How many questions?</InputLabel>
        <Select
          labelId="game-mode-label"
          id="game-mode-select"
          value={howMany}
          label="How many questions?"
          onChange={handleHowManyChange}
        >
          <MenuItem value="infinite">Infinite</MenuItem>
          <MenuItem value="preset">Let me choose</MenuItem>
        </Select>
      </FormControl>

      <br />

      {howMany === "preset" && (
        <TextField
          fullWidth
          sx={{ mt: 2 }}
          type="number"
          label="Number of Questions"
          value={presetNumberOfQuestions}
          onChange={handlePresetNumberOfQuestionsChange}
          InputProps={{
            inputProps: {
              min: 1,
            },
          }}
        />
      )}

      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Players will answer</InputLabel>
        <Select
          value={sameOrDifferent}
          onChange={handleSameOrDifferentChange}
        >
          <MenuItem value="same">Same Question</MenuItem>
          <MenuItem value="different">Different Questions</MenuItem>
        </Select>
      </FormControl>

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

        {categories && categories.length > 0 && !loading && !error && (
          <Grid item xs={12}>
            <CategoryCard centred category={randomCategory} onClick={handleCategoryClick} />
          </Grid>
        )}

        {categories && categories.length > 0 && categories.map((category: Category) => (
          <Grid item key={category.id} xs={12} sm={6} md={4}>
            <CategoryCard category={category} onClick={handleCategoryClick} />
          </Grid>
        ))}

      </Grid>
    </RootContainer>
  );
};

export default Index;
