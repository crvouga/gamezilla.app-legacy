import { composeWithDevTools } from "@redux-devtools/extension";
import {
  Action,
  applyMiddleware,
  createStore as createReduxStore,
} from "redux";
import createSagaMiddleware from "redux-saga";
import { spawn } from "redux-saga/effects";
import { logUnknownActionsSaga } from "./sagas";

export const createStore = <
  TState,
  TAction extends Action<any>,
  TGenerator extends Generator
>({
  reducer,
  initialState,
  saga,
  isAction,
}: {
  reducer: (state: TState, action: TAction) => TState;
  initialState: TState;
  isAction: (action: unknown) => action is TAction;
  saga: () => TGenerator;
}) => {
  const rootReducer = (maybeState: TState | undefined, action: TAction) => {
    const state = maybeState ?? initialState;

    if (isAction(action)) {
      return reducer(state, action);
    }

    return state;
  };

  function* rootSaga() {
    yield spawn(logUnknownActionsSaga, { isAction });
    yield spawn(saga);
  }

  const sagaMiddleware = createSagaMiddleware();

  const store = createReduxStore(
    rootReducer,
    undefined,
    composeWithDevTools(applyMiddleware(sagaMiddleware))
  );

  sagaMiddleware.run(rootSaga);

  return store;
};
