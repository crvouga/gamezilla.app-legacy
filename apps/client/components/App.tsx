import { actions, selectors } from "@gamezilla/core";

import { createClient } from "../entry";

import {
  IonApp,
  IonIcon,
  IonLabel,
  IonLoading,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonToast,
  setupConfig,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { home, person } from "ionicons/icons";
import { Provider, useDispatch, useSelector } from "react-redux";
import { Redirect, Route } from "react-router-dom";
import { useAuthSlice, useProfileSlice } from "../hooks";
import { HomePage } from "./routes";
import { AuthPage } from "./routes/auth";
import { ProfilePage } from "./routes/profile";
import { ProfileEditPage } from "./routes/profile/edit";

setupConfig({
  mode: "md",
});

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

const AppToasts = () => {
  const toasts = useSelector(selectors.toast.slice);
  const dispatch = useDispatch();

  return (
    <>
      {toasts.map((toast, index) => (
        <IonToast
          isOpen={index === 0}
          key={toast.id}
          message={toast.message}
          buttons={[
            {
              text: "Done",
              role: "cancel",
              handler: () => {
                dispatch(actions.toast.dismiss(toast));
              },
            },
          ]}
        />
      ))}
    </>
  );
};

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
