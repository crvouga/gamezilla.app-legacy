import constate from "constate";
import { useState } from "react";
import { useMutation } from "react-query";
import { useLoginSession } from "../LoginSession";
import {
  IAvatarSeed,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarUrl,
} from "./avatar";
import { profileDataAccess } from "./profile";

const useAvatarEdit = () => {
  const { profile } = useLoginSession();
  const parsed = parseAvatarUrl(profile.avatarUrl);
  const [avatarSeed, setAvatarSeed] = useState<IAvatarSeed>(parsed.avatarSeed);
  const [avatarStyle, setAvatarStyle] = useState<IAvatarStyle>(
    parsed.avatarStyle
  );
  const avatarUrl = toAvatarUrl({ avatarSeed, avatarStyle });
  const mutation = useMutation({
    mutationFn: () => {
      return profileDataAccess.update({
        ...profile,
        avatarUrl: toAvatarUrl({
          avatarSeed,
          avatarStyle,
        }),
      });
    },
  });

  const isTouched = profile.avatarUrl !== avatarUrl;

  const reset = () => {
    const parsed = parseAvatarUrl(profile.avatarUrl);
    setAvatarSeed(parsed.avatarSeed);
    setAvatarStyle(parsed.avatarStyle);
  };

  return {
    isTouched,
    mutation,
    avatarUrl,
    avatarStyle,
    avatarSeed,
    setAvatarSeed,
    setAvatarStyle,
    reset,
  };
};

export const [AvatarEditContext, useAvatarEditContext] = constate(
  useAvatarEdit
);
