import { NavigationContainer } from "@react-navigation/native";
import { registerRootComponent } from "expo";
import AppLoading from "expo-app-loading";
/** URL polyfill. Required for Supabase queries to work in React Native. */
import "react-native-url-polyfill/auto";
import { App } from "./app/app";
import { StoreProvider } from "./data-access/store";
import { theme, useFontState } from "./theme";
import { ThemeProvider, useWebStyles } from "./ui";

const Root = () => {
  const fontState = useFontState();

  useWebStyles({
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  });

  if (fontState.type === "loading") {
    return <AppLoading />;
  }

  return (
    <StoreProvider>
      <ThemeProvider theme={theme}>
        <NavigationContainer theme={theme}>
          <App />
        </NavigationContainer>
      </ThemeProvider>
    </StoreProvider>
  );
};

registerRootComponent(Root);
