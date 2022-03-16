import { composeWithDevTools } from "@redux-devtools/extension";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware from "redux-saga";
import * as App from "./app-state";

const sagaMiddleware = createSagaMiddleware();

const reducer = (state: App.IState = App.initialState, action: App.IAction) => {
  return App.reducer(state, action);
};

export const appStore = createStore(
  reducer,
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
