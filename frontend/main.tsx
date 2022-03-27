import { useReduxDevToolsExtension } from "@react-navigation/devtools";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { registerRootComponent } from "expo";
import AppLoading from "expo-app-loading";
import { View } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
/** URL polyfill. Required for Supabase queries to work in React Native. */
import "react-native-url-polyfill/auto";
import { Provider as ReduxProvider } from "react-redux";
import { AppView } from "./app/app-view";
import { store } from "./store";
import { darkTheme, useFontState } from "./ui";
import { useWebStyles } from "./ui/use-web-styles";

const Root = () => {
  const fontsState = useFontState();

  useWebStyles({ backgroundColor: darkTheme.colors.background });

  const navigationRef = useNavigationContainerRef();

  useReduxDevToolsExtension(navigationRef);

  if (fontsState.type === "loading") {
    return <AppLoading />;
  }

  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={darkTheme}>
        <NavigationContainer ref={navigationRef} theme={darkTheme}>
          <View
            style={{
              flex: 1,
              backgroundColor: darkTheme.colors.background,
            }}
          >
            <AppView />
          </View>
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
};

registerRootComponent(Root);
