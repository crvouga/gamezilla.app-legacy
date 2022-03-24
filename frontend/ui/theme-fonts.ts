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
import { Fonts } from "react-native-paper/lib/typescript/types";

export const fonts: Fonts = {
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
};

export const useFontState = () => {
  let [isLoaded, error] = useFonts({
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

  if (error) {
    return {
      type: "error",
    } as const;
  }

  if (isLoaded) {
    return {
      type: "success",
    } as const;
  }

  return {
    type: "loading",
  } as const;
};
