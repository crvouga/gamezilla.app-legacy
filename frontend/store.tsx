import {
  TypedUseSelectorHook,
  useDispatch as useDispatchRedux,
  useSelector as useSelectorRedux,
} from "react-redux";
import { createStore } from "../common/utils";
import * as App from "./app-state";
import { dataAccess } from "./app-data-access";

export const store = createStore({
  reducer: App.reducer,
  isAction: (action): action is App.IAction => {
    return Object.values(App.actions).some((actionCreator) =>
      actionCreator.match(action)
    );
  },
  saga: function* () {
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
