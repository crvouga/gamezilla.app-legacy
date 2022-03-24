import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import merge from "deepmerge";
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
} from "react-native-paper";

export const defaultTheme = merge(PaperDefaultTheme, NavigationDefaultTheme);
export const darkTheme = merge(PaperDarkTheme, NavigationDarkTheme);

export const spacing = (n: number) => {
  return n * 12;
};

export const fontSize = (n: number) => {
  return n * 6;
};
