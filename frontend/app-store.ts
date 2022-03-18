import { composeWithDevTools } from "@redux-devtools/extension";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import * as App from "./app-state";

const sagaMiddleware = createSagaMiddleware();

export const appStore = createStore(
  (maybeState: App.IState | undefined, action: App.IAction) => {
    const state = maybeState ?? App.initialState;

    if (App.isAction(action)) {
      return App.reducer(state, action);
    }

    return state;
  },
  App.initialState,
  composeWithDevTools(applyMiddleware(sagaMiddleware))
);

sagaMiddleware.run(App.saga);

/*


*/

export type IAppState = ReturnType<typeof appStore.getState>;
export type IAppDispatch = typeof appStore.dispatch;

export const useAppDispatch = () => useDispatch<IAppDispatch>();
export const useAppSelector: TypedUseSelectorHook<IAppState> = useSelector;
