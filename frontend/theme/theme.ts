"use client";

import { createTheme } from "@mui/material/styles";
import { appPalette } from "./palette";

const theme = createTheme({
  palette: {
    primary: {
      main: appPalette.color3,
      dark: appPalette.color4,
      light: appPalette.color2,
      contrastText: "#ffffff",
    },
    secondary: {
      main: appPalette.color2,
      dark: appPalette.color4,
      light: appPalette.color1,
      contrastText: appPalette.color5,
    },
    background: {
      default: appPalette.color1,
      paper: "#ffffff",
    },
    text: {
      primary: appPalette.color5,
      secondary: appPalette.color4,
    },
    error: {
      main: "#c62828",
    },
  },
  typography: {
    fontFamily: '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif',
    h4: { fontWeight: 700, color: appPalette.color4 },
    h5: { fontWeight: 600, color: appPalette.color4 },
    h6: { fontWeight: 600, color: appPalette.color4 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
        },
        containedPrimary: {
          backgroundColor: appPalette.color3,
          "&:hover": { backgroundColor: appPalette.color4 },
        },
        outlinedPrimary: {
          borderColor: appPalette.color3,
          color: appPalette.color3,
          "&:hover": {
            borderColor: appPalette.color4,
            backgroundColor: "rgba(50, 92, 139, 0.08)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${appPalette.color2}`,
          boxShadow: "0 4px 14px rgba(29, 45, 75, 0.08)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: appPalette.color1,
          color: appPalette.color4,
          border: `1px solid ${appPalette.color2}`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          border: `1px solid ${appPalette.color2}`,
          boxShadow: "0 24px 48px rgba(29, 45, 75, 0.2)",
        },
      },
    },
  },
});

export default theme;
