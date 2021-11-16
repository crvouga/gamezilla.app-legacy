import { IonApp } from "@ionic/react";
import { Provider } from "react-redux";
import { store } from "../../core/store";
import { Auth } from "./auth";

export const Index = () => {
  return (
    <Provider store={store}>
      <IonApp>
        <Auth />
      </IonApp>
    </Provider>
  );
};
