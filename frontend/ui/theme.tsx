import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import merge from "deepmerge";
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
  configureFonts,
} from "react-native-paper";
import { fonts } from "./theme-fonts";

type IPaperTheme = typeof PaperDefaultTheme & typeof PaperDarkTheme;
type INavigationTheme = typeof NavigationDefaultTheme &
  typeof NavigationDarkTheme;

type ITheme = IPaperTheme & INavigationTheme;

export const defaultTheme: ITheme = {
  ...merge(PaperDefaultTheme, NavigationDefaultTheme),
  fonts: configureFonts({
    ios: fonts,
    web: fonts,
    android: fonts,
    default: fonts,
  }),
};

export const darkTheme: ITheme = {
  ...merge(PaperDarkTheme, NavigationDarkTheme),
  fonts: configureFonts({
    ios: fonts,
    web: fonts,
    android: fonts,
    default: fonts,
  }),
};

export const spacing = (n: number) => {
  return n * 12;
};

export const fontSize = (n: number) => {
  return n * 6;
};
