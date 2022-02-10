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
import { IThemeMode } from "./theme-data";

const defaultTheme = createTheme();

const baseOptions: ThemeOptions = {
  palette: {
    primary: blue,
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

const darkTheme = responsiveFontSizes(
  createTheme(deepmerge(baseOptions, darkOptions))
);

const lightTheme = responsiveFontSizes(
  createTheme(deepmerge(baseOptions, lightOptions))
);

export const ThemeProvider = ({
  themeMode,
  children,
}: {
  themeMode: IThemeMode;
  children: React.ReactNode;
}) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const systemTheme = prefersDarkMode ? darkTheme : lightTheme;

  const theme = {
    light: lightTheme,
    dark: darkTheme,
    system: systemTheme,
  }[themeMode];

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
