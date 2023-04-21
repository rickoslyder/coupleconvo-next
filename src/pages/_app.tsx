import { GameStateProvider } from '@/contexts/GameStateContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import '@/styles/globals.css';
import AppBar from '../components/AppBar/AppBar';
import { Analytics } from '@vercel/analytics/react'
  ;
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <AppBar />
      <GameStateProvider>
        <Component {...pageProps} />
        <Analytics />
      </GameStateProvider>
    </ThemeProvider>
  );
}
