import { configureStore } from "@reduxjs/toolkit";
import {
  TypedUseSelectorHook,
  useDispatch as useDispatchRedux,
  useSelector as useSelectorRedux,
} from "react-redux";
import createSagaMiddleware from "redux-saga";
import { takeEvery } from "redux-saga/effects";
import { createEventEmitter } from "../common/utils";
import { dataAccess } from "./app-data-access";
import * as App from "./app-state";

export const actionEmitter = createEventEmitter<{
  [key in App.IAction["type"]]: Extract<App.IAction, { type: key }>;
}>();

const rootReducer = (
  maybeState: App.IState | undefined,
  action: App.IAction
) => {
  const state = maybeState ?? App.initialState;

  return App.reducer(state, action) ?? state;
};

function* rootSaga() {
  yield takeEvery("*", function* (action: App.IAction) {
    actionEmitter.emit(action.type, action);
  });

  yield App.saga({
    dataAccess,
  });
}

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: rootReducer,
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(rootSaga);

/* 


React


*/

export const useSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelectorRedux;

export const useDispatch = () => useDispatchRedux<() => App.IAction>();
