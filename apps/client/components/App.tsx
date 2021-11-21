import {
  IonApp,
  IonIcon,
  IonLabel,
  IonLoading,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { home, person } from "ionicons/icons";
import { Provider } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import { store } from "../core/store";
import { useAuthState } from "../hooks";
import { HomePage } from "./routes";
import { AuthPage } from "./routes/auth";
import { ProfilePage } from "./routes/profile";
import { ProfileEditPage } from "./routes/profile/edit";

const AppRoutes = () => {
  const authState = useAuthState();

  switch (authState.type) {
    case "signed-in":
      return (
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Redirect from="/" to="/home" exact />
              <Route path="/home" component={HomePage} exact />
              <Route path="/profile" component={ProfilePage} exact />
              <Route path="/profile/edit" component={ProfileEditPage} exact />
            </IonRouterOutlet>

            <IonTabBar slot="bottom">
              <IonTabButton tab="home" href="/home">
                <IonIcon icon={home} />
                <IonLabel>Home</IonLabel>
              </IonTabButton>

              <IonTabButton tab="profile" href="/profile">
                <IonIcon icon={person} />
                <IonLabel>Profile</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>
        </IonReactRouter>
      );

    case "signed-out":
      return <AuthPage />;

    case "loading":
      return <IonLoading isOpen />;
  }
};

export const App = () => {
  return (
    <Provider store={store}>
      <IonApp className="max-w-2xl m-auto">
        <AppRoutes />
      </IonApp>
    </Provider>
  );
};
