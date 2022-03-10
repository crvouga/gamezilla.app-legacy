import {
  createTheme,
  CssBaseline,
  responsiveFontSizes,
  ThemeOptions,
  ThemeProvider as MuiThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import { deepmerge } from "@mui/utils";
import React from "react";

const defaultTheme = createTheme();

const baseOptions: ThemeOptions = {
  palette: {
    primary: blue,
  },
  typography: {
    fontSize: 20,
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
    MuiAppBar: {
      defaultProps: {
        position: "static",
        elevation: 0,
        color: "transparent",
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          border: `1px solid ${defaultTheme.palette.divider}`,
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        variant: "outlined",
      },
    },

    MuiButton: {
      defaultProps: {
        size: "large",
      },
      styleOverrides: {
        root: {
          borderRadius: "2rem",
          textTransform: "none",
        },
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
};

export const darkOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    background: {
      default: "#000",
      paper: "#101010",
    },
  },
};

export const lightOptions: ThemeOptions = {
  palette: {
    mode: "light",
  },
};

const darkTheme = createTheme(deepmerge(baseOptions, darkOptions));
const lightTheme = createTheme(deepmerge(baseOptions, lightOptions));

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const _theme = prefersDarkMode ? darkTheme : lightTheme;

  return (
    <MuiThemeProvider theme={darkTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
