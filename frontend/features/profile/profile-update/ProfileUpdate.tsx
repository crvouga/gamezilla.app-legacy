import React from "react";
import { Route, Routes } from "react-router-dom";
import { IProfile } from "../profile-data-access";
import ProfileUpdateAvatar from "./ProfileUpdateAvatar";
import ProfileUpdateIndex from "./ProfileUpdateIndex";
import ProfileUpdateName from "./ProfileUpdateName";
import ProfileUpdateUsername from "./ProfileUpdateUsername";

const ProfileUpdate = ({ profile }: { profile: IProfile }) => {
  return (
    <Routes>
      <Route path="" element={<ProfileUpdateIndex profile={profile} />} />

      <Route
        path="avatar/*"
        element={<ProfileUpdateAvatar profile={profile} />}
      />

      <Route path="name" element={<ProfileUpdateName profile={profile} />} />

      <Route
        path="username"
        element={<ProfileUpdateUsername profile={profile} />}
      />
    </Routes>
  );
};

export default ProfileUpdate;
