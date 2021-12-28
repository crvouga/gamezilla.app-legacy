import {
  AVATAR_STYLES,
  parseAvatarUrl,
  toAvatarSeed,
  toAvatarUrl,
} from "./avatar";

describe("avatar", () => {
  it("creates and parses avatar url", () => {
    for (const avatarStyle of Object.values(AVATAR_STYLES)) {
      const avatarSeed = toAvatarSeed(String(Math.random()));

      const url = toAvatarUrl({ avatarSeed, avatarStyle });

      const parsed = parseAvatarUrl(url);

      expect(parsed).toEqual({ avatarSeed, avatarStyle });
    }
  });
});
