import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { ticTacToe } from "./tic-tac-toe";

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    [ticTacToe.namespace]: ticTacToe.reducer,
  },
  middleware: [sagaMiddleware],
});

function* rootSaga() {
  console.log("SAGA running");
  yield ticTacToe.saga();
}

sagaMiddleware.run(rootSaga);
