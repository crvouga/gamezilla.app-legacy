import {
  IonApp,
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
import { logoGoogle, logoInstagram, logoTiktok } from "ionicons/icons";

export const App = () => {
  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Gamezilla</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <IonList>
            <IonItem button onClick={() => {}}>
              <IonIcon icon={logoGoogle} slot="start" />
              <IonLabel>
                Sign In With Google
              </IonLabel>
            </IonItem>

            <IonItem button onClick={() => {}}>
              <IonIcon icon={logoInstagram} slot="start" />

              <IonLabel>
                Sign In With Instagram
              </IonLabel>
            </IonItem>

            <IonItem button onClick={() => {}}>
              <IonIcon icon={logoTiktok} slot="start" />

              <IonLabel>
                Sign In With Tik Tok
              </IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      </IonPage>
    </IonApp>
  );
};
