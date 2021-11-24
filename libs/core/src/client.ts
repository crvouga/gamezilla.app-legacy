import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { reducer, saga } from "./root";

export type IClientDependencies = Parameters<typeof saga>[0];

export const createClient = (dependencies: IClientDependencies) => {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer,
    middleware: [sagaMiddleware],
  });

  sagaMiddleware.run(saga, dependencies);

  return {
    store,
  };
};
