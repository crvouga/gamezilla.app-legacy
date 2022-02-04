import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import React from "react";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: blue,
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        position: "sticky",
        elevation: 0,
        // variant: "outlined",
      },
    },

    MuiLink: {
      defaultProps: {
        underline: "none",
        color: "inherit",
      },
    },

    MuiAlert: {
      defaultProps: {
        variant: "filled",
      },
      styleOverrides: {
        root: {
          width: "100%",
        },
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
