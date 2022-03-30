import {
  Nunito_200ExtraLight,
  Nunito_200ExtraLight_Italic,
  Nunito_300Light,
  Nunito_300Light_Italic,
  Nunito_400Regular,
  Nunito_400Regular_Italic,
  Nunito_600SemiBold,
  Nunito_600SemiBold_Italic,
  Nunito_700Bold,
  Nunito_700Bold_Italic,
  Nunito_800ExtraBold,
  Nunito_800ExtraBold_Italic,
  Nunito_900Black,
  Nunito_900Black_Italic,
  useFonts,
} from "@expo-google-fonts/nunito";
import { ReactNode } from "react";
import { createTheme, ThemeProvider, useWebStyles } from "../ui";

const theme = createTheme({
  mode: "dark",
  fonts: {
    regular: {
      fontFamily: "Nunito_800ExtraBold",
      fontWeight: "normal",
    },
    medium: {
      fontFamily: "Nunito_900Black",
      fontWeight: "normal",
    },
    light: {
      fontFamily: "Nunito_700Bold",
      fontWeight: "normal",
    },
    thin: {
      fontFamily: "Nunito_700Bold",
      fontWeight: "normal",
    },
  },
});

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  useWebStyles({
    backgroundColor: theme.colors.background,
  });

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export const useFontState = () => {
  let [isLoaded] = useFonts({
    Nunito_200ExtraLight,
    Nunito_200ExtraLight_Italic,
    Nunito_300Light,
    Nunito_300Light_Italic,
    Nunito_400Regular,
    Nunito_400Regular_Italic,
    Nunito_600SemiBold,
    Nunito_600SemiBold_Italic,
    Nunito_700Bold,
    Nunito_700Bold_Italic,
    Nunito_800ExtraBold,
    Nunito_800ExtraBold_Italic,
    Nunito_900Black,
    Nunito_900Black_Italic,
  });

  if (isLoaded) {
    return {
      type: "success",
    } as const;
  }

  return {
    type: "loading",
  } as const;
};
