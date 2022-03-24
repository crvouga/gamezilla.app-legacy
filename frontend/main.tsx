import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./ui-components";
import { IAction, reducer, actions, saga } from "./app/app-logic";
import { dataAccess } from "./app/app-data-access";
import { isActions, createStore } from "./utils";
import { AppView } from "./app/app-view";

const store = createStore({
  reducer,
  initialState: {
    type: "loading",
  },
  isAction: (action: unknown): action is IAction => {
    return isActions(actions, action);
  },
  saga: function* () {
    yield* saga(dataAccess);
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
        <AppView state={state} dispatch={store.dispatch} />
      </ThemeProvider>
    </BrowserRouter>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));
