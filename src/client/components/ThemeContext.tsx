import React from "react";
import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        position: "sticky",
        elevation: 0,
        color: "transparent",
        sx: {
          borderBottom: "2px solid rgba(0, 0, 0, 0.5)",
        },
      },
    },

    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
    },
  },
});

const theme = responsiveFontSizes(darkTheme);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
