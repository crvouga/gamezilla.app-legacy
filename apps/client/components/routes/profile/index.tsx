import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from "@ionic/react";
import { exitOutline, pencil } from "ionicons/icons";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { actions } from "../../../core";
import { ProfileEditPageBody } from "./edit";

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const [state, setState] = useState<"editing" | "idle">("idle");
  const [present] = useIonAlert();

  return (
    <>
      <IonModal isOpen={state === "editing"}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton
                onClick={() => {
                  setState("idle");
                }}
              >
                Cancel
              </IonButton>
            </IonButtons>
            <IonTitle>Edit Profile</IonTitle>
            <IonButtons slot="end">
              <IonButton color="primary">Done</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <ProfileEditPageBody />
      </IonModal>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Profile</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <IonItem
            button
            onClick={() => {
              setState("editing");
            }}
          >
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
    </>
  );
};
