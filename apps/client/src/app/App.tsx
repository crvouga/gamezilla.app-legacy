import { IonApp, setupConfig } from "@ionic/react";
import "@ionic/react/css/core.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import { Provider } from "react-redux";
import "tailwindcss/tailwind.css";
import { AppRoutes } from "./AppRoutes";
import { AppToasts } from "./AppToasts";
import { createStore } from "./store";
import "./styles/global.css";
import "./styles/variables.css";

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
