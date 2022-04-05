import { NavigationContainer } from "@react-navigation/native";
import { registerRootComponent } from "expo";
import AppLoading from "expo-app-loading";
/** URL polyfill. Required for Supabase queries to work in React Native. */
import "react-native-url-polyfill/auto";
import { Provider } from "react-redux";
import { ThemeProvider, useWebStyles } from "../common/ui";
import { App } from "./app";
import { store } from "./store";
import { theme, useFontState } from "./theme";

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
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <NavigationContainer theme={theme}>
          <App />
        </NavigationContainer>
      </ThemeProvider>
    </Provider>
  );
};

registerRootComponent(Root);
