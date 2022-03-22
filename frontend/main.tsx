import React from "react";
import * as ReactDOM from "react-dom";
import { useEffect, useState } from "react";
import * as App from "./app/app";
import * as AppDataAccess from "./app/app-data-access";
import { createStore } from "./utils";

const store = createStore({
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

ReactDOM.render(<Root />, document.getElementById("root"));
