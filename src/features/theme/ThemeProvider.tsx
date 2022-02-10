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
import { usePersistedState } from "../../utility/use-persisted-state";
import { decodeThemeMode, IThemeMode, encodeThemeMode } from "./theme-data";

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

const THEME_MODE_LOCAL_STORAGE_KEY = "theme-mode";

export const getThemeMode = () => {
  return decodeThemeMode(
    localStorage.getItem(THEME_MODE_LOCAL_STORAGE_KEY) ?? ""
  );
};

export const setThemeMode = (themeMode: IThemeMode) => {
  localStorage.setItem(
    THEME_MODE_LOCAL_STORAGE_KEY,
    encodeThemeMode(themeMode)
  );
};

const THEME_MODE_KEY = "theme-mode";

const ThemeModeContext = React.createContext({
  themeMode: decodeThemeMode(localStorage.getItem(THEME_MODE_KEY) ?? ""),
  setThemeMode: (themeMode: IThemeMode) => {
    localStorage.setItem(THEME_MODE_KEY, themeMode);
  },
});

export const useThemeModeContext = () => {
  return React.useContext(ThemeModeContext);
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const systemTheme = prefersDarkMode ? darkTheme : lightTheme;

  const [themeMode, setThemeMode] = usePersistedState(
    "theme-mode",
    encodeThemeMode,
    decodeThemeMode,
    "SYSTEM"
  );

  const theme =
    themeMode === "DARK"
      ? darkTheme
      : themeMode === "LIGHT"
      ? lightTheme
      : themeMode === "SYSTEM"
      ? systemTheme
      : systemTheme;

  return (
    <ThemeModeContext.Provider value={{ themeMode, setThemeMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default ThemeProvider;
