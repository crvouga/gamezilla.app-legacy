import { IonApp } from "@ionic/react";
import { Provider } from "react-redux";
import { store } from "../core/store";

import { AppRoutes } from "./AppRoutes";

export const App = () => {
  return (
    <Provider store={store}>
      <IonApp>
        <AppRoutes />
      </IonApp>
    </Provider>
  );
};
