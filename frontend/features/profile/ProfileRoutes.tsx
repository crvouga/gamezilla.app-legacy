import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { IProfile } from "./profile-data-access";
import ProfileDelete from "./profile-delete";
import ProfileUpdate from "./profile-update";

const ProfileRoutes = ({ profile }: { profile: IProfile }) => {
  return (
    <Routes>
      <Route path="/update/*" element={<ProfileUpdate profile={profile} />} />

      <Route
        path="/delete"
        element={<ProfileDelete userId={profile.userId} />}
      />

      <Route path="*" element={<Navigate to="update" />} />
    </Routes>
  );
};

export default ProfileRoutes;
