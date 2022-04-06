import {
  TypedUseSelectorHook,
  useDispatch as useDispatchRedux,
  useSelector as useSelectorRedux,
} from "react-redux";
import {
  createEventEmitter,
  createStore,
  InferActionMap,
} from "../common/utils";
import * as App from "./app-state";
import { dataAccess } from "./app-data-access";
import { takeEvery } from "redux-saga/effects";

export const actionEmitter = createEventEmitter<{
  [key in App.IAction["type"]]: Extract<App.IAction, { type: key }>;
}>();

export const store = createStore({
  reducer: App.reducer,
  isAction: (action): action is App.IAction => {
    return Object.values(App.actions).some((actionCreator) =>
      actionCreator.match(action)
    );
  },
  saga: function* () {
    yield takeEvery("*", function* (action: App.IAction) {
      actionEmitter.emit(action.type, action);
    });

    yield App.saga({
      dataAccess,
      selector: (_) => _ as App.IState,
    });
  },
  initialState: App.initialState,
});

export const useSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelectorRedux;

export const useDispatch = () => useDispatchRedux<() => App.IAction>();
