import { IonApp, setupConfig } from "@ionic/react";
import { Provider } from "react-redux";
import { AppRoutes } from "./AppRoutes";
import { AppToasts } from "./AppToasts";
import { createStore } from "./store";

setupConfig({
  mode: "ios",
});

const { store } = createStore();

export const App = () => {
  return (
    <Provider store={store}>
      <IonApp className="max-w-2xl m-auto">
        <AppRoutes />
        <AppToasts />
      </IonApp>
    </Provider>
  );
};
