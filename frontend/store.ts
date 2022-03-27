import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import * as App from "./app/app-state";
import { createStore } from "./utils";

export const store = createStore({
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

/**
 *
 *
 *
 *
 *
 */

export const useAppSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector;

export const useAppDispatch = () => useDispatch<App.IAction>();
