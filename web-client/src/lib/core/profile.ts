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
  return seed.replace(" ", "").replace(";", "") as IAvatarSeed;
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
