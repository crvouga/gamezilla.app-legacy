import {
  createTheme,
  useMediaQuery,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider as MuiThemeProvider,
  ThemeOptions,
} from "@mui/material";
import { blue } from "@mui/material/colors";
import { deepmerge } from "@mui/utils";
import React, { useState } from "react";

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

export type IThemeMode = "light" | "dark" | "system";

const getStoredThemeMode = (): IThemeMode => {
  const value = localStorage.getItem("themeMode");

  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return "dark";
};

const setStoredThemeMode = (themeMode: IThemeMode) => {
  localStorage.setItem("themeMode", themeMode);
};

const ThemeModeContext = React.createContext<{
  themeMode: IThemeMode;
  setThemeMode: (themeMode: IThemeMode) => void;
}>({ themeMode: getStoredThemeMode(), setThemeMode: setStoredThemeMode });

export const useThemeMode = () => {
  return React.useContext(ThemeModeContext);
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const systemTheme = prefersDarkMode ? darkTheme : lightTheme;

  const [themeMode, setThemeMode] = useState(getStoredThemeMode);

  const theme = {
    light: lightTheme,
    dark: darkTheme,
    system: systemTheme,
  }[themeMode];

  return (
    <ThemeModeContext.Provider value={{ themeMode, setThemeMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
};
