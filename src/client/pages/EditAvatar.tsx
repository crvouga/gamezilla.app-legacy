import React, { useEffect, useState } from "react";
import { Avatar, Button, ModalLoader, PageBar } from "../components";
import { List, Record } from "../../shared/utility";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarUrl,
} from "../../shared/avatar";
import { useUpdateProfile } from "../data-access";

export const EditAvatarPage = ({
  profile,
}: {
  profile: { userId: string; avatarUrl?: string };
}) => {
  const parsed = parseAvatarUrl(profile.avatarUrl);

  const [selectedStyle, setSelectedStyle] = useState<IAvatarStyle>(
    parsed.avatarStyle
  );

  const avatarUrl = toAvatarUrl({
    avatarSeed: parsed.avatarSeed,
    avatarStyle: selectedStyle,
  });

  const isTouched = selectedStyle !== parsed.avatarStyle;

  const [state, setState] = useState<"idle" | "saving">("idle");

  const updateProfile = useUpdateProfile();

  const handleSave = async () => {
    if (state === "saving") {
      return;
    }

    setState("saving");

    await updateProfile({
      ...profile,
      avatarUrl,
    });

    setState("idle");
  };

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
    <>
      {state === "saving" && <ModalLoader title="Saving..." />}

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
        right={<Button onClick={handleSave} text="Done" />}
      />

      <div className="w-full flex flex-col justify-center items-center mt-4 mb-6">
        <Avatar className="w-52 h-52 mb-2" src={avatarUrl} />

        <div className="text-2xl font-medium">
          {formatAvatarStyle(selectedStyle)}
        </div>
      </div>

      <div className=" w-full flex overflow-x-scroll">
        {List.splitEvery(4, Object.values(AVATAR_STYLES)).map(
          (avatarStyles) => (
            <div
              key={avatarStyles.join(",")}
              className="w-full grid gap-4 grid-cols-3 grid-rows-3"
            >
              {avatarStyles.map((avatarStyle) => (
                <div
                  ref={refByStyle[avatarStyle]}
                  key={avatarStyle}
                  className="w-1/2 p-4 flex flex-col text-center"
                  onClick={() => setSelectedStyle(avatarStyle)}
                >
                  <Avatar
                    className={`w-full h-full mb-2 ${
                      selectedStyle === avatarStyle
                        ? "border-4 border-black"
                        : ""
                    }`}
                    src={toAvatarUrl({
                      avatarStyle,
                      avatarSeed: parsed.avatarSeed,
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
          )
        )}
      </div>
    </>
  );
};
