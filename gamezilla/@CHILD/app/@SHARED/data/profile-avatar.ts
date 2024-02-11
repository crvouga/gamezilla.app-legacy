export type ProfileAvatarStyle =
  | "adventurer"
  | "adventurer-neutral"
  | "avataaars"
  | "bottts"
  | "big-ears"
  | "big-ears-neutral"
  | "big-smile"
  | "croodles"
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
  | "pixel-art-neutral"
  | "fun-emoji"
  | "thumbs"

const STYLES: { [style in ProfileAvatarStyle]: ProfileAvatarStyle } = {
  thumbs: "thumbs",
  adventurer: "adventurer",
  "adventurer-neutral": "adventurer-neutral",
  avataaars: "avataaars",
  "big-ears": "big-ears",
  bottts: "bottts",
  "big-ears-neutral": "big-ears-neutral",
  "big-smile": "big-smile",
  croodles: "croodles",
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
  "fun-emoji": "fun-emoji",
}

const ALL_STYLES = Object.keys(STYLES) as ProfileAvatarStyle[]

const capitalize = (word: string) => {
  const [first, ...rest] = word.split("")
  return [first?.toUpperCase() ?? "", ...rest].join("")
}

const formatStyle = (style: ProfileAvatarStyle) => {
  return style.split("-").map(capitalize).join(" ")
}

const toStyle = (style: string): ProfileAvatarStyle => {
  if (style in STYLES) {
    return style as ProfileAvatarStyle
  }

  return "adventurer"
}

export type ProfileAvatarSeed = string & { type: "Seed" }

const toSeed = (seedString: string) => {
  return seedString
    .replace(" ", "")
    .replace(";", "")
    .replace(".", "") as ProfileAvatarSeed
}

const toUrl = ({
  seed,
  style,
}: {
  style: ProfileAvatarStyle
  seed: string
}) => {
  const BASE_URL = `https://api.dicebear.com/7.x`
  const FILE_TYPE = "svg"
  const url = new URL(`${BASE_URL}/${style}/${FILE_TYPE}`)
  url.searchParams.append("seed", seed)

  const str = url.toString()

  return str
}

const parseUrl = (
  avatarUrl?: string,
): {
  seed: ProfileAvatarSeed
  style: ProfileAvatarStyle
} => {
  try {
    if (!avatarUrl) {
      return {
        style: toStyle("adventurer"),
        seed: toSeed(""),
      }
    }

    const [style, seed] =
      new URL(avatarUrl)?.pathname?.split(".")?.[0]?.split("/")?.slice(-2) ?? []

    if (style && seed) {
      return {
        style: toStyle(style),
        seed: toSeed(seed),
      }
    }
    return {
      style: toStyle("adventurer"),
      seed: toSeed(""),
    }
  } catch (error) {
    return {
      style: toStyle("adventurer"),
      seed: toSeed(""),
    }
  }
}

const generateRandomSeed = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return toSeed(String(Math.floor(Math.random() * 10000)))
}

const randomStyle = (): ProfileAvatarStyle => {
  const styles = shuffle(ALL_STYLES)
  return styles[0] ?? "adventurer-neutral"
}

const shuffle = <T>(xs: T[]): T[] => {
  const ys = [...xs]

  ys.sort(() => (Math.random() > 0.5 ? 1 : -1))

  return ys
}

export const ProfileAvatar = {
  randomStyle,
  generateRandomSeed,
  parseUrl,
  toUrl,
  toSeed,
  toStyle,
  formatStyle,
  ALL_STYLES,
  STYLES,
}
