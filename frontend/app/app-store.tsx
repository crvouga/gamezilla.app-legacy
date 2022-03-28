import { ReactNode } from "react";
import {
  Provider,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import { createStore } from "../utils";
import * as App from "./app-state";

const store = createStore({
  reducer: App.reducer,
  isAction: (action): action is App.IAction => {
    return Object.values(App.actions).some((actionCreator) =>
      actionCreator.match(action)
    );
  },
  saga: App.saga,
  initialState: {
    auth: {
      type: "loading",
    },
    profile: {
      type: "loading",
    },
  },
});

export const AppStoreProvider = ({ children }: { children: ReactNode }) => {
  return <Provider store={store}>{children}</Provider>;
};

export const useAppSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector;

export const useAppDispatch = () => useDispatch<App.IAction>();
