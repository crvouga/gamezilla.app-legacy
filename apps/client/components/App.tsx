import { createClient } from "@gamezilla/core";
import { clientDependencies } from "@gamezilla/third-party";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonLoading,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { home, person } from "ionicons/icons";
import { Provider } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import { useAuthSlice, useProfileSlice } from "../hooks";
import { HomePage } from "./routes";
import { AuthPage } from "./routes/auth";
import { ProfilePage } from "./routes/profile";
import { ProfileEditPage } from "./routes/profile/edit";

const AppRoutes = () => {
  const authSlice = useAuthSlice();

  const profileSlice = useProfileSlice();

  switch (authSlice.type) {
    case "signed-out":
      return <AuthPage />;

    case "loading":
      return <IonLoading isOpen message="Signing In"></IonLoading>;

    case "signed-in":
      switch (profileSlice.type) {
        case "loading":
          return <IonLoading isOpen message="Loading Profile"></IonLoading>;

        case "loaded":
          return (
            <IonReactRouter>
              <IonTabs>
                <IonRouterOutlet>
                  <Redirect from="/" to="/home" exact />
                  <Route path="/home" component={HomePage} exact />
                  <Route path="/profile" component={ProfilePage} exact />
                  <Route
                    path="/profile/edit"
                    component={ProfileEditPage}
                    exact
                  />
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
      }
  }
};

const { store } = createClient(clientDependencies);

export const App = () => {
  return (
    <Provider store={store}>
      <IonApp className="max-w-2xl m-auto">
        <AppRoutes />
      </IonApp>
    </Provider>
  );
};
