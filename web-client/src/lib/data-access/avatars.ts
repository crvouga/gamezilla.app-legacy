export type IAvatarStyle =
  | "adventurer"
  | "adventurer-neutral"
  | "avataaars"
  | "big-ears"
  | "big-ears-neutral"
  | "big-smile";

export type IAvatarSeed = string & { type: "AvatarSeed" };

export const toAvatarSeed = (seed: string) => {
  return seed.replace(" ", "") as IAvatarSeed;
};

export const toAvatarUrl = ({
  avatarSeed,
  avatarStyle,
}: {
  avatarSeed: IAvatarSeed;
  avatarStyle: IAvatarStyle;
}) => {
  return `https://avatars.dicebear.com/api/${avatarStyle}/${avatarSeed}.svg`;
};
