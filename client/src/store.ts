import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: (state, _action) => state,
  middleware: [sagaMiddleware],
});

function* rootSaga() {
  console.log("SAGA running");
  yield;
}

sagaMiddleware.run(rootSaga);
