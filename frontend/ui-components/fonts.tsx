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
} from "@expo-google-fonts/nunito";
import { useFonts } from "expo-font";

export const fonts = {
  Nunito_200ExtraLight: "Nunito_200ExtraLight",
  Nunito_200ExtraLight_Italic: "Nunito_200ExtraLight_Italic",
  Nunito_300Light: "Nunito_300Light",
  Nunito_300Light_Italic: "Nunito_300Light_Italic",
  Nunito_400Regular: "Nunito_400Regular",
  Nunito_400Regular_Italic: "Nunito_400Regular_Italic",
  Nunito_600SemiBold: "Nunito_600SemiBold",
  Nunito_600SemiBold_Italic: "Nunito_600SemiBold_Italic",
  Nunito_700Bold: "Nunito_700Bold",
  Nunito_700Bold_Italic: "Nunito_700Bold_Italic",
  Nunito_800ExtraBold: "Nunito_800ExtraBold",
  Nunito_800ExtraBold_Italic: "Nunito_800ExtraBold_Italic",
  Nunito_900Black: "Nunito_900Black",
  Nunito_900Black_Italic: "Nunito_900Black_Italic",
};

export const useLoadFonts = () => {
  return useFonts({
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
};
