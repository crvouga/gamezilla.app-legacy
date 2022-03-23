import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";
import React from "react";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    fontFamily: ["Nunito"].join(","),
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        position: "sticky",
        elevation: 0,
      },
    },

    MuiButton: {
      defaultProps: {
        size: "large",
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
