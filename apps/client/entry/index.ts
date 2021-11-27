import { reducer, saga } from "@gamezilla/core";
import { supabaseServices } from "@gamezilla/data-access";
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

export const createClient = () => {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer,
    middleware: [sagaMiddleware],
  });

  sagaMiddleware.run(saga, supabaseServices);

  return {
    store,
  };
};
