import { registerRootComponent } from "expo";
import { useEffect, useState } from "react";
import * as App from "./app/app";
import * as AppDataAccess from "./app/app-data-access";
import { configureStore } from "./configure-store";

const store = configureStore({
  reducer: App.reducer,
  initialState: App.initialState,
  isAction: App.isAction,
  saga: function* () {
    yield* App.saga(AppDataAccess);
  },
});

const Root = () => {
  const [state, setState] = useState(store.getState);

  useEffect(() => {
    store.subscribe(() => {
      setState(store.getState);
    });
  }, []);

  return <App.view state={state} dispatch={store.dispatch} />;
};

registerRootComponent(Root);
