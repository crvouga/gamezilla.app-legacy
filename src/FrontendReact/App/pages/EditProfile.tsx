import React from "react";
import { Avatar } from "../../Components/Avatar";
import { Button } from "../../Components/Button";
import { PageBar } from "../../Components/PageBar";
import { Link, Routes, Route } from "react-router-dom";

export const EditProfilePage = ({
  profile,
}: {
  profile: { avatarUrl?: string };
}) => {
  return (
    <>
      <PageBar center="Edit Profile" />

      <Avatar className="w-36 h-36 m-auto mt-4" src={profile.avatarUrl} />

      <Link to="/edit/profile/avatar">
        <Button
          className="m-auto mt-2"
          text="Edit Avatar"
          // onClick={onEditAvatar}
        />
      </Link>
    </>
  );
};
