import { setupConfig, IonApp } from "@ionic/react";
import { AppProviders } from "./AppProviders";
import { AppRoutes } from "./AppRoutes";
import { AppToasts } from "./AppToasts";

setupConfig({
  mode: "ios",
});

export const App = () => {
  return (
    <AppProviders>
      <IonApp className="max-w-2xl m-auto">
        <AppRoutes />
        <AppToasts />
      </IonApp>
    </AppProviders>
  );
};
