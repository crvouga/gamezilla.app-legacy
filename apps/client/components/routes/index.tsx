import {
  IonAvatar,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { useDispatch } from "react-redux";
import { actions } from "../../core";

export const IndexPage = () => {
  const dispatch = useDispatch();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonAvatar />
        <IonList>
          <IonItem button onClick={() => {}}>
            <IonLabel>Create Game</IonLabel>
          </IonItem>
        </IonList>

        <IonButton onClick={() => dispatch(actions.auth.signOut())}>
          Sign Out
        </IonButton>
      </IonContent>
    </IonPage>
  );
};
