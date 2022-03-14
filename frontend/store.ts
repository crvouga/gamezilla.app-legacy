import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import { applyMiddleware, createStore } from "redux";
import createSagaMiddleware, { channel, END, stdChannel } from "redux-saga";
import * as App from "./app-state";
import { composeWithDevTools } from "redux-devtools-extension";

const sagaMiddleware = createSagaMiddleware();

const initialState: App.IState = {
  game: {
    type: "loading",
  },
};

const reducer = (
  state: App.IState = initialState,
  action: App.IAction
): App.IState => {
  return App.reducer(state, action);
};

export const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(sagaMiddleware))
);

const actionChannel = channel<App.IAction>();

actionChannel.take((action) => {
  // @ts-ignore
  store.dispatch(action);
});

sagaMiddleware.run(App.saga, actionChannel);

/*


*/

export type IAppState = ReturnType<typeof store.getState>;
export type IAppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<IAppDispatch>();
export const useAppSelector: TypedUseSelectorHook<IAppState> = useSelector;
