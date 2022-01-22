import React, { useState } from "react";
import { Link } from "react-location";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarSeed,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarUrl,
} from "../../shared/avatar";
import {
  Avatar,
  Button,
  Icons,
  Item,
  ModalLoader,
  PageBar,
} from "../components";
import { updateProfile } from "../data-access";
import { useMutation } from "react-query";

export const EditAvatarPage = ({
  profile,
}: {
  profile: {
    userId: string;
    avatarUrl?: string;
  };
}) => {
  const parsed = parseAvatarUrl(profile.avatarUrl);

  const [selectedStyle, setSelectedStyle] = useState<IAvatarStyle>(
    parsed.avatarStyle
  );

  const avatarUrl = toAvatarUrl(selectedStyle, parsed.avatarSeed);

  const mutation = useMutation(updateProfile);

  if (mutation.status === "loading") {
    return <ModalLoader title="Saving..." />;
  }

  return (
    <>
      <PageBar
        left={
          <Button
            onClick={() => {
              setSelectedStyle(parsed.avatarStyle);
            }}
            text="Cancel"
          />
        }
        center="Edit Avatar"
        right={
          <Button
            onClick={() => {
              mutation.mutate({
                userId: profile.userId,
                avatarUrl,
              });
            }}
            text="Done"
          />
        }
      />

      <div className="w-full flex flex-col justify-center items-center mt-4 mb-6">
        <Avatar className="w-52 h-52 mb-2" src={avatarUrl} />

        <div className="text-2xl font-medium">
          {formatAvatarStyle(selectedStyle)}
        </div>
      </div>

      <Link to="choose-style">
        <Item
          start={<Avatar src={avatarUrl} />}
          center="Choose Style"
          end={<Icons.CheveronRight />}
        />
      </Link>
    </>
  );
};

export const EditAvatarChooseStyle = ({
  avatarSeed,
  selectedStyle,
  onSelect,
}: {
  avatarSeed: IAvatarSeed;
  selectedStyle: IAvatarStyle;
  onSelect: (style: IAvatarStyle) => void;
}) => {
  return (
    <div>
      {Object.values(AVATAR_STYLES).map((avatarStyle) => (
        <div key={avatarStyle} className="w-full flex-1">
          <Avatar
            className={`w-full`}
            src={toAvatarUrl(avatarStyle, avatarSeed)}
          />
          <div className="font-medium text-lg text-center p-2">
            {formatAvatarStyle(avatarStyle)}
          </div>
        </div>
      ))}
    </div>
  );
};
