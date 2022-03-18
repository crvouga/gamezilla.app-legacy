import { App, AppDataAccess } from "./app";
import { runApp } from "./run-app";

runApp({
  container: document.body,
  initialState: App.initialState,
  reducer: App.reducer,
  view: App.view,
  saga: function* () {
    yield* App.saga(AppDataAccess);
  },
  isAction: App.isAction,
});
