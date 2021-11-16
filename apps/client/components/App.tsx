import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { logoGoogle } from "ionicons/icons";
import { useState } from "react";

export const App = () => {
  const [state, setState] = useState<"loading" | "idle">("idle");

  const handleGoogleAuth = () => {
    setState("loading");
  };

  return (
    <>
      <IonApp>
        <IonLoading
          isOpen={state === "loading"}
          onDidDismiss={() => setState("idle")}
          duration={3000}
        />
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Gamezilla</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonContent>
            <IonList>
              <IonItem button onClick={handleGoogleAuth}>
                <IonIcon icon={logoGoogle} slot="start" />
                <IonLabel>
                  Sign In With Google
                </IonLabel>
              </IonItem>
            </IonList>
          </IonContent>
        </IonPage>
      </IonApp>
    </>
  );
};
