import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import createSagaMiddleware from "redux-saga";
import * as App from "./app-state";

const sagaMiddleware = createSagaMiddleware();

export const appStore = configureStore({
  reducer: App.reducer,
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(App.saga);

/*


*/

export type IAppState = ReturnType<typeof appStore.getState>;
export type IAppDispatch = typeof appStore.dispatch;

export const useAppDispatch = () => useDispatch<IAppDispatch>();
export const useAppSelector: TypedUseSelectorHook<IAppState> = useSelector;
