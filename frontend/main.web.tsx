import React, { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { AppView } from "./app/app-view";
import { store } from "./main-store";
import { ThemeProvider } from "./ui-components";

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
