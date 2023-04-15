// src/pages/index.tsx
import React from 'react';
import CategoryCard from '../components/CategoryCard/CategoryCard';
import { MenuItem, FormControl, Select, InputLabel, SelectChangeEvent, TextField } from '@mui/material';
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

  React.useEffect(() => {
    async function fetchCategories() {
      const cachedCategories = loadFromLocalStorage("categories");
      if (cachedCategories) {
        console.log(cachedCategories)
        setCategories(cachedCategories);
        setLoadedFromCache(true);
      } else {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
        console.log(fetchedCategories)
        saveToLocalStorage("categories", fetchedCategories);
        setLoadedFromCache(false);
      }
    }

    fetchCategories();
  }, []);

  const { startGame, setState, nextQuestion } = React.useContext(GameStateContext);
  const router = useRouter();

  const [gameMode, setGameMode] = useState<"infinite" | "timed" | "unlimited" | "preset">("unlimited");
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(10);
  const [sameOrDifferent, setSameOrDifferentState] = useState<"same" | "different">("same");
  const [showSummary, setShowSummary] = useState(false);

  const handleCategoryClick = (category: Category) => {
    startGame(category, gameMode);
    setState((prevState) => ({ ...prevState, gameOver: false }));
    setShowSummary(false);
    // nextQuestion();
    router.push('/question');
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

  console.log(categories);

  return (
    <RootContainer>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Typography variant="h1">CoupleConvo</Typography>
        <Typography variant="h5">The ultimate conversation starter game for couples</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <HomeIcon />
        <PlayArrowIcon />
        <QuizIcon />
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
        {categories.map((category: Category) => (
          <Grid item key={category.id} xs={12} sm={6} md={4}>
            <CategoryCard category={category} onClick={handleCategoryClick} />
          </Grid>
        ))}
      </Grid>
    </RootContainer>
  );
};

export default Index;
