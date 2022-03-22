import {
  createTheme,
  CssBaseline,
  ThemeProvider as MuiThemeProvider,
  Container,
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
  },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MuiThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container disableGutters maxWidth="sm">
        {children}
      </Container>
    </MuiThemeProvider>
  );
};
