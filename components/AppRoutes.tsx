import { selectors } from "../client";
import {
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
import { useSelector } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import { HomePage } from "./routes";
import { AuthPage } from "./routes/auth";
import { ProfilePage } from "./routes/profile";
import { ProfileEditPage } from "./routes/profile/edit";

export const AppRoutes = () => {
  const authSlice = useSelector(selectors.auth.state);
  const profileSlice = useSelector(selectors.profile.slice);

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
