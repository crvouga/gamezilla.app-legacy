import { IonApp, setupConfig } from "@ionic/react";
import { Provider } from "react-redux";
import { createClient } from "../../entry";
import { AppRoutes } from "./AppRoutes";
import { AppToasts } from "./AppToasts";

setupConfig({
  mode: "ios",
});

const { store } = createClient();

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
