import { registerRootComponent } from "expo";
import React from "react";
/** URL polyfill. Required for Supabase queries to work in React Native. */
import "react-native-url-polyfill/auto";
import { Provider } from "react-redux";
import { AppView } from "./app/app-view";
import { store } from "./main-store";

const Root = () => {
  return (
    <Provider store={store}>
      <AppView />
    </Provider>
  );
};

registerRootComponent(Root);
