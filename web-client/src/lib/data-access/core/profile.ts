import type { IUserId } from "./user";

export enum AvatarStyles {
  "adventurer" = "adventurer",
  "adventurer-neutral" = "adventurer-neutral",
  "avataaars" = "avataaars",
  "big-ears" = "big-ears",
  "big-ears-neutral" = "big-ears-neutral",
  "big-smile" = "big-smile",
  "croodles-neutral" = "croodles-neutral",
}

export const toAvatarStyle = (avatarStyle: string) => {
  if (avatarStyle in AvatarStyles) {
    return avatarStyle as AvatarStyles;
  }

  return AvatarStyles["adventurer"];
};

export type IAvatarSeed = string & { type: "AvatarSeed" };

export const toAvatarSeed = (seed: string) => {
  return seed.replace(" ", "") as IAvatarSeed;
};

export const toAvatarUrl = ({
  avatarSeed,
  avatarStyle,
}: {
  avatarSeed: IAvatarSeed;
  avatarStyle: AvatarStyles;
}) => {
  return `https://avatars.dicebear.com/api/${avatarStyle}/${avatarSeed}.svg`;
};

export type IProfile = {
  userId: IUserId;
  avatarSeed: IAvatarSeed;
  avatarStyle: AvatarStyles;
};

export type IProfileDataAccess = {
  onProfile({
    userId,
  }: {
    userId: IUserId;
  }, set: (profile: IProfile | null) => void): () => void;

  update(
    updates: {
      userId: string;
      avatarSeed: IAvatarSeed;
      avatarStyle: AvatarStyles;
    },
  ): Promise<{ errors: Error[] }>;
};
