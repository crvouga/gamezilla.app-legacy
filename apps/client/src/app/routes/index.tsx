import { actions } from "@gamezilla/core";
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useDispatch } from "react-redux";

export const HomePage = () => {
  const dispatch = useDispatch();
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem
            button
            onClick={() => {
              dispatch(actions.game.create());
            }}
          >
            <IonLabel>Create Game</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
