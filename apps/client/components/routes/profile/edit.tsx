import {
  IonAvatar,
  IonButton,
  IonButtons,
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
import { actions, selectors } from "apps/client/core";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarSeed,
  toAvatarStyle,
  toAvatarUrl,
} from "apps/client/core/profile/avatar";
import { useAuthProfile } from "apps/client/hooks";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export const ProfileEditPage = () => {
  const dispatch = useDispatch();

  const profile = useSelector(selectors.profile.slice);
  const parsed = parseAvatarUrl(profile?.avatarUrl ?? "");

  const [avatarStyle, setAvatarStyle] = useState<IAvatarStyle>(
    parsed.avatarStyle
  );
  const [avatarSeed, setAvatarSeed] = useState(parsed.avatarSeed);

  const handleSubmit = () => {
    const avatarUrl = toAvatarUrl({
      avatarSeed,
      avatarStyle,
    });

    dispatch(
      actions.profile.editProfile({
        avatarUrl: avatarUrl,
        name: "idk",
      })
    );
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton>Cancel</IonButton>
          </IonButtons>
          <IonTitle>Edit Profile</IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={handleSubmit} color="primary">
              Done
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

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
          <IonInput
            onIonChange={(e) => setAvatarSeed(toAvatarSeed(e.detail.value))}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Name</IonLabel>
          <IonInput />
        </IonItem>
      </IonContent>
    </IonPage>
  );
};
