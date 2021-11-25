import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { reducer, saga } from "./root";
import { io } from "socket.io-client";

export type IClientDependencies = Parameters<typeof saga>[0];

export const createClient = (dependencies: IClientDependencies) => {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer,
    middleware: [sagaMiddleware],
  });

  sagaMiddleware.run(saga, dependencies);

  const socket = io("http://localhost:3333");

  socket.onAny((event) => {
    console.log({ event });
  });

  return {
    store,
  };
};
