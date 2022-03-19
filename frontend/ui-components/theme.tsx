import { configureFonts, DarkTheme } from "react-native-paper";
import { fonts } from "./fonts";

const fontConfig = {
  regular: {
    fontFamily: fonts.Nunito_400Regular,
  },
  light: {
    fontFamily: fonts.Nunito_300Light,
  },
  medium: {
    fontFamily: fonts.Nunito_600SemiBold,
  },
  thin: {
    fontFamily: fonts.Nunito_200ExtraLight,
  },
};

export const theme: typeof DarkTheme = {
  ...DarkTheme,
  dark: true,
  roundness: 2,
  fonts: configureFonts({
    web: fontConfig,
    android: fontConfig,
    ios: fontConfig,
    windows: fontConfig,
    default: fontConfig,
  }),
};

export const spacing = (count: number) => 8 * count;
