import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";
import React from "react";
import { LinkBehavior } from "./Link";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        position: "sticky",
        elevation: 0,
        variant: "outlined",
      },
    },

    MuiLink: {
      defaultProps: {
        underline: "none",
        color: "inherit",
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
