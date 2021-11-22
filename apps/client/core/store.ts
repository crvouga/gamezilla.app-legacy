import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { sagaParameters } from "../supabase";
import { reducer, saga } from "./root";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer,
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(saga, sagaParameters);
