import {
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import { exitOutline, pencil } from "ionicons/icons";
import { useDispatch } from "react-redux";
import { actions } from "../../../core";

export const ProfilePage = () => {
  const dispatch = useDispatch();

  const [present] = useIonAlert();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      {/* 
      <IonAvatar className="mx-auto my-4 w-36 h-36 border border-gray-700">
        <IonImg
          src={toAvatarUrl({
            avatarSeed: toAvatarSeed("123"),
            avatarStyle: "adventurer",
          })}
        />
      </IonAvatar> */}

      <IonContent>
        <IonItem button routerLink="/profile/edit">
          <IonIcon slot="start" icon={pencil} />

          <IonLabel>Edit Profile</IonLabel>
        </IonItem>
        <IonItem
          button
          onClick={() => {
            present({
              header: "Sign out of Gamezilla?",
              buttons: [
                "Cancel",
                {
                  text: "Sign Out",
                  handler: (d) => {
                    dispatch(actions.auth.signOut());
                  },
                },
              ],
            });
          }}
        >
          <IonIcon slot="start" icon={exitOutline} />
          <IonLabel>Sign Out</IonLabel>
        </IonItem>
      </IonContent>
    </IonPage>
  );
};
