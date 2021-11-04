import { capitalize, generateUniqueId, removeKey, shuffle } from "$lib/utility";

export type IAvatarStyle =
  | "adventurer"
  | "adventurer-neutral"
  | "avataaars"
  | "big-ears"
  | "big-ears-neutral"
  | "big-smile"
  | "croodles-neutral"
  | "gridy"
  | "identicon"
  | "initials"
  | "jdenticon"
  | "micah"
  | "miniavs"
  | "open-peeps"
  | "personas"
  | "pixel-art"
  | "pixel-art-neutral";

export const AVATAR_STYLES: { [avatarStyle in IAvatarStyle]: IAvatarStyle } = {
  adventurer: "adventurer",
  "adventurer-neutral": "adventurer-neutral",
  avataaars: "avataaars",
  "big-ears": "big-ears",
  "big-ears-neutral": "big-ears-neutral",
  "big-smile": "big-smile",
  "croodles-neutral": "croodles-neutral",
  gridy: "gridy",
  identicon: "identicon",
  initials: "initials",
  jdenticon: "jdenticon",
  micah: "micah",
  miniavs: "miniavs",
  "open-peeps": "open-peeps",
  personas: "personas",
  "pixel-art": "pixel-art",
  "pixel-art-neutral": "pixel-art-neutral",
};

export const ALL_AVATAR_STYLES = Object.keys(AVATAR_STYLES) as IAvatarStyle[];

export const formatAvatarStyle = (avatarStyle: IAvatarStyle) => {
  return avatarStyle.split("-").map(capitalize).join(" ");
};

export const toAvatarStyle = (avatarStyle: string) => {
  if (avatarStyle in AVATAR_STYLES) {
    return avatarStyle as IAvatarStyle;
  }

  return AVATAR_STYLES["adventurer"];
};

export type IAvatarSeed = string & { type: "AvatarSeed" };

export const toAvatarSeed = (seed: string) => {
  return seed.replace(" ", "").replace(";", "") as IAvatarSeed;
};

const AVATAR_URL_ROOT = `https://avatars.dicebear.com/api`;
const AVATAR_FILE_TYPE = "svg";

export const toAvatarUrl = ({
  avatarSeed,
  avatarStyle,
}: {
  avatarSeed: IAvatarSeed;
  avatarStyle: IAvatarStyle;
}) => {
  return `${AVATAR_URL_ROOT}/${avatarStyle}/${avatarSeed}.${AVATAR_FILE_TYPE}`;
};

export const parseAvatarUrl = (
  avatarUrl?: string
): { avatarSeed: IAvatarSeed; avatarStyle: IAvatarStyle } => {
  const [avatarStyle, avatarSeed] = new URL(avatarUrl).pathname
    .split("/")
    .flatMap((_) => _.split("."))
    .slice(-3);

  return {
    avatarStyle: toAvatarStyle(avatarStyle),
    avatarSeed: toAvatarSeed(avatarSeed),
  };
};

export const generateAvatarSeed = () => {
  return toAvatarSeed(generateUniqueId());
};

export const generateAvatarUrl = (seed?: string) => {
  const avatarSeed = toAvatarSeed(seed ?? "");
  const randomAvatarStyle = toAvatarStyle(
    shuffle(Object.keys(removeKey("initials", AVATAR_STYLES)))[0]
  );

  return toAvatarUrl({
    avatarStyle: randomAvatarStyle,
    avatarSeed,
  });
};
