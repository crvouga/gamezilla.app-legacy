import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { logoGoogle } from "ionicons/icons";
import { useDispatch } from "react-redux";
import { actions } from "@gamezilla/core";

export const AuthPage = () => {
  const dispatch = useDispatch();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sign In</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem
            button
            onClick={() => dispatch(actions.auth.signIn({ type: "google" }))}
          >
            <IonIcon icon={logoGoogle} slot="start" />
            <IonLabel>Sign In With Google</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
