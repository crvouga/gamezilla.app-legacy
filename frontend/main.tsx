import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import * as App from "./app/app";
import * as AppDataAccess from "./app/app-data-access";
import { ThemeProvider } from "./ui-components";
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

  return (
    <BrowserRouter>
      <ThemeProvider>
        <App.view state={state} dispatch={store.dispatch} />
      </ThemeProvider>
    </BrowserRouter>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));
