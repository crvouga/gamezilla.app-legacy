import { Action, configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { app, appSaga } from "./app-state";

const sagaMiddleware = createSagaMiddleware();

export const appStore = configureStore({
  reducer: (state = app.initialState, action: Action) => {
    return app.reducer(state, action);
  },
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(appSaga);
