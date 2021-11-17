import { IonLoading, IonRouterOutlet } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { useAuthState } from "../hooks";
import { IndexPage } from "./routes";
import { AuthPage } from "./routes/auth";

export const AppRoutes = () => {
  const authState = useAuthState();

  switch (authState.type) {
    case "signed-in":
      return (
        <IonReactRouter>
          <IndexPage />
        </IonReactRouter>
      );

    case "signed-out":
      return <AuthPage />;

    case "loading":
      return <IonLoading isOpen />;
  }
};
