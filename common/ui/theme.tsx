import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import constate from "constate";
import merge from "deepmerge";
import { ReactNode } from "react";
import {
  configureFonts,
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
  Provider as PaperProvider,
} from "react-native-paper";

type IPaperTheme = typeof PaperDefaultTheme & typeof PaperDarkTheme;
type INavigationTheme = typeof NavigationDefaultTheme &
  typeof NavigationDarkTheme;

type ITheme = IPaperTheme & INavigationTheme;

export const defaultTheme: ITheme = {
  ...merge(PaperDefaultTheme, NavigationDefaultTheme),
};

const darkTheme: ITheme = {
  ...merge(PaperDarkTheme, NavigationDarkTheme),
};

export const spacing = (n: number) => {
  return n * 8;
};

export const fontSize = (n: number) => {
  return n * 6;
};

export const zIndex = (type: "modal" | "normal") => {
  switch (type) {
    case "modal":
      return 10;

    case "normal":
      return 1;
  }
};

const [ThemeContext, useThemeContext] = constate(
  ({ theme }: { theme: ITheme }) => {
    return theme;
  }
);

export const useTheme = (): ITheme => {
  return useThemeContext();
};

export type IThemeFonts = {
  regular: {
    fontFamily: string;
    fontWeight: "normal";
  };
  medium: {
    fontFamily: string;
    fontWeight: "normal";
  };
  light: {
    fontFamily: string;
    fontWeight: "normal";
  };
  thin: {
    fontFamily: string;
    fontWeight: "normal";
  };
};

export const createTheme = ({
  mode,
  fonts,
}: {
  mode: "dark" | "light";
  fonts: IThemeFonts;
}): ITheme => {
  return {
    ...(mode === "dark" ? darkTheme : defaultTheme),
    fonts: configureFonts({
      ios: fonts,
      web: fonts,
      android: fonts,
      default: fonts,
    }),
  };
};

export const ThemeProvider = ({
  theme,
  children,
}: {
  theme: ITheme;
  children: ReactNode;
}) => {
  return (
    <PaperProvider theme={theme}>
      <ThemeContext theme={theme}>{children}</ThemeContext>
    </PaperProvider>
  );
};
