import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarStyle,
  toAvatarSeed,
  toAvatarStyle,
  toAvatarUrl,
} from "apps/client/core/avatar";
import { useAuthUser } from "apps/client/hooks";
import { useState } from "react";

export const ProfileEditPage = () => {
  const authUser = useAuthUser();

  const [avatarStyle, setAvatarStyle] = useState<IAvatarStyle>("adventurer");

  const isTouched = avatarStyle !== "adventurer";

  const handleDiscard = () => {
    setAvatarStyle("adventurer");
  };

  const handleSave = () => {};

  return (
    <IonPage>
      {isTouched ? (
        <IonHeader>
          <IonToolbar>
            <IonLabel>Save Edits?</IonLabel>
            <IonButtons slot="end">
              <IonButton onClick={handleDiscard}>Discard</IonButton>
              <IonButton color="primary">Save</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
      ) : (
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton />
            </IonButtons>
            <IonTitle>Edit Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
      )}

      <IonContent>
        <IonAvatar className="mx-auto my-4 w-36 h-36 border border-gray-700">
          <IonImg
            src={toAvatarUrl({
              avatarSeed: toAvatarSeed("123"),
              avatarStyle,
            })}
          />
        </IonAvatar>

        <IonItem>
          <IonLabel position="floating">Avatar Style</IonLabel>

          <IonSelect
            value={avatarStyle}
            onIonChange={(e) => setAvatarStyle(toAvatarStyle(e.detail.value))}
            interface="popover"
          >
            {Object.keys(AVATAR_STYLES).map((avatarStyle) => (
              <IonSelectOption key={avatarStyle} value={avatarStyle}>
                {formatAvatarStyle(toAvatarStyle(avatarStyle))}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Name</IonLabel>
          <IonInput />
        </IonItem>
      </IonContent>
    </IonPage>
  );
};
