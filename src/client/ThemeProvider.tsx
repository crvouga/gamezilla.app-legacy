import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material";
import { green } from "@mui/material/colors";
import React from "react";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: green,
    background: {
      default: "#000",
      paper: "#232323",
    },
  },
  typography: {
    fontSize: 18,
    fontFamily: [
      "Nunito",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },

  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },

    MuiCircularProgress: {
      defaultProps: {
        disableShrink: true,
      },
      styleOverrides: {},
    },

    MuiLinearProgress: {
      defaultProps: {
        variant: "indeterminate",
      },
    },

    MuiAppBar: {
      defaultProps: {
        position: "static",
        elevation: 0,
        color: "transparent",
        // variant: "outlined",
      },
    },

    MuiLink: {
      defaultProps: {
        underline: "none",
        color: "inherit",
      },
    },

    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: "outlined",
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

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
