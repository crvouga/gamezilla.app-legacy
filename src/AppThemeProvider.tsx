import {
  createTheme,
  useMediaQuery,
  CssBaseline,
  responsiveFontSizes,
  ThemeProvider,
  ThemeOptions,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { deepmerge } from "@mui/utils";
import React from "react";

const baseOptions: ThemeOptions = {
  palette: {
    primary: green,
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

export const AppThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = prefersDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
};
