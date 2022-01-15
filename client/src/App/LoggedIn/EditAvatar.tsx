import { Avatar } from "Components/Avatar";
import { Button } from "Components/Button";
import { ModalLoader } from "Components/ModalLoader";
import { PageBar } from "Components/PageBar";
import React, { useEffect, useState } from "react";

import { definitions, supabaseClient } from "supabase";
import {
  AVATAR_STYLES,
  formatAvatarStyle,
  IAvatarStyle,
  parseAvatarUrl,
  toAvatarUrl,
} from "./avatar";
import * as Icons from "Components/Icons";
import { mapValues } from "utility";

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

  const handleSave = async () => {
    if (state === "saving") {
      return;
    }

    setState("saving");

    await supabaseClient
      .from<definitions["profile"]>("profile")
      .update({
        avatar_url: avatarUrl,
      })
      .match({ id: profile.userId });

    setState("idle");
  };

  const refByStyle = mapValues(AVATAR_STYLES, () =>
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

      {isTouched ? (
        <PageBar
          className="justify-between"
          left="Save Changes?"
          right={
            <div className="flex">
              <Button
                className="p-0 mr-4"
                onClick={() => {
                  setSelectedStyle(parsed.avatarStyle);
                }}
                text="Cancel"
              />
              <Button className="p-0" onClick={handleSave} text="Save" />
            </div>
          }
        />
      ) : (
        <PageBar center="Edit Avatar" />
      )}

      <div className="w-full flex flex-col justify-center items-center mt-4 mb-6">
        <Avatar className="w-52 h-52 mb-2" src={avatarUrl} />

        <div className="text-2xl font-medium">
          {formatAvatarStyle(selectedStyle)}
        </div>
      </div>

      <div className="overflow-x-auto w-full flex scroll-pl-6">
        {Object.values(AVATAR_STYLES).map((avatarStyle) => (
          <div
            ref={refByStyle[avatarStyle]}
            key={avatarStyle}
            className="mr-4 flex flex-col text-center"
            onClick={() => setSelectedStyle(avatarStyle)}
          >
            <Avatar
              className={`w-24 h-24 mb-2 ${
                selectedStyle === avatarStyle ? "border-4 border-black" : ""
              }`}
              src={toAvatarUrl({ avatarStyle, avatarSeed: parsed.avatarSeed })}
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
    </>
  );
};
