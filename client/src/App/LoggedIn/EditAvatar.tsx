import { Avatar } from "Components/Avatar";
import { Button } from "Components/Button";
import { PageBar } from "Components/PageBar";
import React from "react";
import { useRouter } from "./useRouter";

export const EditAvatarPage = ({
  profile,
}: {
  profile: { avatarUrl?: string };
}) => {
  const router = useRouter();
  return (
    <>
      <PageBar title="Edit Avatar" />
      <Avatar className="w-52 h-52 m-auto mt-4" src={profile.avatarUrl} />
    </>
  );
};
