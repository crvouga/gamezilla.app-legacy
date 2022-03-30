import { ReactNode } from "react";
import {
  Provider,
  TypedUseSelectorHook,
  useDispatch as useDispatchRedux,
  useSelector as useSelectorRedux,
} from "react-redux";
import { createStore } from "./utils";
import * as App from "./app/app-state";

const store = createStore({
  reducer: App.reducer,
  isAction: (action): action is App.IAction => {
    return Object.values(App.actions).some((actionCreator) =>
      actionCreator.match(action)
    );
  },
  saga: App.saga,
  initialState: {
    game: {
      type: "closed",
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
