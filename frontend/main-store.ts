import { dataAccess } from "./app/app-data-access";
import * as App from "./app/app-logic";
import { createStore, isActions } from "./utils";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const store = createStore({
  reducer: App.reducer,
  initialState: App.initialState,
  isAction: (action: unknown): action is App.IAction => {
    return isActions(App.actions, action);
  },
  saga: function* () {
    yield* App.saga(dataAccess);
  },
});

export const useAppSelector: TypedUseSelectorHook<App.IState> = useSelector;
export const useAppDispatch = () => useDispatch<typeof store.dispatch>();
