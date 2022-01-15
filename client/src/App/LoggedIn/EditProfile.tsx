import { Avatar } from "src/Components/Avatar";
import { Button } from "src/Components/Button";
import { PageBar } from "src/Components/PageBar";
import React from "react";
import { useRouter } from "./useRouter";

export const EditProfilePage = ({
  profile,
}: {
  profile: { avatarUrl?: string };
}) => {
  const router = useRouter();
  return (
    <>
      <PageBar center="Edit Profile" />

      <Avatar className="w-36 h-36 m-auto mt-4" src={profile.avatarUrl} />

      <Button
        className="m-auto mt-2"
        text="Edit Avatar"
        onClick={() => {
          router.push({ route: "edit-avatar" });
        }}
      />
    </>
  );
};
