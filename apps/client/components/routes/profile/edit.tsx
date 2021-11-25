import {
  actions,
  AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarSeed,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarSeed,
  toAvatarStyle,
  toAvatarUrl,
} from "@gamezilla/core";
import {
  IonAvatar,
  IonBackButton,
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
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuthProfile } from "../../../hooks";

export const ProfileEditPage = () => {
  const dispatch = useDispatch();

  const profile = useAuthProfile();

  const [avatarStyle, setAvatarStyle] = useState<IAvatarStyle | null>(null);
  const [avatarSeed, setAvatarSeed] = useState<IAvatarSeed | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      const parsed = parseAvatarUrl(profile?.avatarUrl ?? "");
      setAvatarStyle(parsed.avatarStyle);
      setAvatarSeed(parsed.avatarSeed);
      setName(profile.name);
    }
  }, [profile, profile?.avatarUrl, profile?.name]);

  const handleSubmit = () => {
    if (avatarSeed && avatarStyle && name) {
      dispatch(
        actions.profile.edit({
          avatarUrl: toAvatarUrl({
            avatarSeed,
            avatarStyle,
          }),
          name,
        })
      );
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>

          <IonTitle>Edit Profile</IonTitle>

          <IonButtons slot="end">
            <IonButton onClick={handleSubmit} color="primary">
              Submit
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
            value={avatarSeed}
            onIonChange={(e) => setAvatarSeed(toAvatarSeed(e.detail.value))}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Name</IonLabel>
          <IonInput value={name} onIonChange={(e) => setName(e.detail.value)} />
        </IonItem>
      </IonContent>
    </IonPage>
  );
};
