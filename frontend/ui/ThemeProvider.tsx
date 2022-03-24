import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import merge from "deepmerge";
import React from "react";
import { View } from "react-native";
import {
  DarkTheme as PaperDarkTheme,
  DefaultTheme as PaperDefaultTheme,
  Provider as PaperProvider,
} from "react-native-paper";

export const defaultTheme = merge(PaperDefaultTheme, NavigationDefaultTheme);
export const darkTheme = merge(PaperDarkTheme, NavigationDarkTheme);

export const spacing = (n: number) => {
  return n * 12;
};

export const fontSize = (n: number) => {
  return n * 6;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <PaperProvider theme={darkTheme}>
        <NavigationContainer theme={darkTheme}>
          <View
            style={{
              backgroundColor: darkTheme.colors.background,
              width: "100%",
              height: "100%",
            }}
          >
            {children}
          </View>
        </NavigationContainer>
      </PaperProvider>
    </>
  );
};
