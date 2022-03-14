import React from "react";
import { render } from "react-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./app";
import { appStore, useAppDispatch, useAppSelector } from "./app-store";
import ThemeProvider from "./features/theme/ThemeProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={appStore}>
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <ThemeProvider>{children}</ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
};

const Root = () => {
  const appState = useAppSelector((appState) => appState);
  const dispatch = useAppDispatch();

  return <App appState={appState} appDispatch={dispatch} />;
};

render(
  <React.StrictMode>
    <Providers>
      <Root />
    </Providers>
  </React.StrictMode>,
  document.getElementById("root")
);
