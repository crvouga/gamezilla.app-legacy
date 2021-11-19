import {
  IonAvatar,
  IonContent,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarStyle,
  toAvatarSeed,
  toAvatarStyle,
  toAvatarUrl,
} from "apps/client/core/avatar";
import { useState } from "react";

export const ProfileEditPageBody = () => {
  const [avatarStyle, setAvatarStyle] = useState<IAvatarStyle>("adventurer");
  const [avatarSeed, setAvatarSeed] = useState("");

  return (
    <IonContent>
      <IonAvatar className="mx-auto my-4 w-36 h-36 border border-gray-700">
        <IonImg
          src={toAvatarUrl({
            avatarSeed: toAvatarSeed(avatarSeed),
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
        <IonLabel position="floating">Avatar Seed</IonLabel>
        <IonInput onIonChange={(e) => setAvatarSeed(e.detail.value)} />
      </IonItem>

      <IonItem>
        <IonLabel position="floating">Name</IonLabel>
        <IonInput />
      </IonItem>
    </IonContent>
  );
};
