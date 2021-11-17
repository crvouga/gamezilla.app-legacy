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

export const HomePage = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem button onClick={() => {}}>
            <IonLabel>Create Game</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
