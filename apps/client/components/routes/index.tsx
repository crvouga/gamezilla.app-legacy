import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { actions } from "../../core";
import { useDispatch } from "react-redux";

export const IndexPage = () => {
  const dispatch = useDispatch();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Hello</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonButton onClick={() => dispatch(actions.auth.signOut())}>
          Sign Out
        </IonButton>
      </IonContent>
    </IonPage>
  );
};
