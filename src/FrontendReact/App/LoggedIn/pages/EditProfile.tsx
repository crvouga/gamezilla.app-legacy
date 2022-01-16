import { Avatar } from "../../../Components/Avatar";
import { Button } from "../../../Components/Button";
import { PageBar } from "../../../Components/PageBar";
import React from "react";

export const EditProfilePage = ({
  profile,
  onEditAvatar,
}: {
  profile: { avatarUrl?: string };
  onEditAvatar: () => void;
}) => {
  return (
    <>
      <PageBar center="Edit Profile" />

      <Avatar className="w-36 h-36 m-auto mt-4" src={profile.avatarUrl} />

      <Button
        className="m-auto mt-2"
        text="Edit Avatar"
        onClick={onEditAvatar}
      />
    </>
  );
};
