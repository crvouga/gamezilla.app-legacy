import { ReactNode } from "react";
import {
  Provider,
  TypedUseSelectorHook,
  useDispatch as useDispatchRedux,
  useSelector as useSelectorRedux,
} from "react-redux";
import * as App from "../app/app-state";
import { createStore } from "../utils";
import { dataAccess } from "./data-access";

const store = createStore({
  reducer: App.reducer,
  isAction: (action): action is App.IAction => {
    return Object.values(App.actions).some((actionCreator) =>
      actionCreator.match(action)
    );
  },
  saga: function* () {
    yield App.saga({ dataAccess, getState: (_) => _ as App.IState });
  },
  initialState: {
    game: {
      type: "stopped",
    },
    auth: {
      type: "loading",
    },
    profile: {
      type: "loading",
    },
  },
});

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  return <Provider store={store}>{children}</Provider>;
};

export const useSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelectorRedux;

export const useDispatch = () => useDispatchRedux<() => App.IAction>();
