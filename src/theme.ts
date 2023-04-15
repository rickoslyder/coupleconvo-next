// src/theme.ts
import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#5c6bc0",
    },
    secondary: {
      main: "#ff4081",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    fontSize: 16,
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

export default theme;
