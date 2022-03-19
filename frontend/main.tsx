import { registerRootComponent } from "expo";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import * as App from "./app/app";
import * as AppView from "./app/app-view";
import * as AppDataAccess from "./app/app-data-access";
import { configureStore } from "./configure-store";
import { useLoadFonts } from "./ui-components/fonts";

const store = configureStore({
  reducer: App.reducer,
  initialState: App.initialState,
  isAction: App.isAction,
  saga: function* () {
    yield* App.saga(AppDataAccess);
  },
});

const Root = () => {
  const [isLoaded, error] = useLoadFonts();

  const [state, setState] = useState(store.getState);

  useEffect(() => {
    store.subscribe(() => {
      setState(store.getState);
    });
  }, []);

  if (!isLoaded) {
    return <Text>Loading...</Text>;
  }

  return <AppView.view state={state} dispatch={store.dispatch} />;
};

registerRootComponent(Root);
