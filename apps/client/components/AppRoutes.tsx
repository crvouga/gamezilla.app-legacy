import {
  IonLoading
} from "@ionic/react";
import { useSelector } from "react-redux";
import { selectors } from "../core";
import { IndexPage } from "./routes";
import { AuthPage } from "./routes/auth";

export const AppRoutes = () => {
  const authState = useSelector(selectors.auth.state);

  switch (authState.type) {
    case "signed-in":
      return <IndexPage />;

    case "signed-out":
      return <AuthPage />;

    case "loading":
      return <IonLoading isOpen />;
  }
};
