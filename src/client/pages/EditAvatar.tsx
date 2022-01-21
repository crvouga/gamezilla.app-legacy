import React, { useEffect, useState } from "react";
import { Avatar, Button, ModalLoader, PageBar } from "../components";
import { List, Record } from "../../shared/utility";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarSeed,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarUrl,
} from "../../shared/avatar";
import { useUpdateProfile } from "../data-access";

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

  const avatarUrl = toAvatarUrl({
    avatarSeed: parsed.avatarSeed,
    avatarStyle: selectedStyle,
  });

  const updateProfile = useUpdateProfile();

  if (updateProfile.status === "mutating") {
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
              updateProfile.mutate({
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

      <EditAvatarSelectGrid
        avatarSeed={parsed.avatarSeed}
        selectedStyle={selectedStyle}
        onSelect={setSelectedStyle}
      />
    </>
  );
};

const EditAvatarSelectGrid = ({
  avatarSeed,
  selectedStyle,
  onSelect,
}: {
  avatarSeed: IAvatarSeed;
  selectedStyle: IAvatarStyle;
  onSelect: (style: IAvatarStyle) => void;
}) => {
  const refByStyle = Record.mapValues(AVATAR_STYLES, () =>
    React.createRef<HTMLDivElement>()
  );

  useEffect(() => {
    refByStyle[selectedStyle]?.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "center",
    });
  }, [selectedStyle]);

  return (
    <div className=" w-full flex overflow-x-scroll">
      {List.splitEvery(4, Object.values(AVATAR_STYLES)).map((avatarStyles) => (
        <div
          key={avatarStyles.join(",")}
          className="w-full grid gap-4 grid-cols-3 grid-rows-3"
        >
          {avatarStyles.map((avatarStyle) => (
            <div
              ref={refByStyle[avatarStyle]}
              key={avatarStyle}
              className="w-1/2 p-4 flex flex-col text-center"
              onClick={() => onSelect(avatarStyle)}
            >
              <Avatar
                className={`w-full h-full mb-2 ${
                  selectedStyle === avatarStyle ? "border-4 border-black" : ""
                }`}
                src={toAvatarUrl({
                  avatarStyle,
                  avatarSeed,
                })}
              />
              <div
                className={`${
                  selectedStyle === avatarStyle ? "font-bold" : "font-light"
                }`}
              >
                {formatAvatarStyle(avatarStyle)}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
