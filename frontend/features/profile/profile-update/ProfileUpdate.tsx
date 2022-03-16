import {
  Backdrop,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  Typography,
} from "@mui/material";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { useAppSelector } from "../../../app-store";
import { IProfile } from "../profile-data-access";
import ProfileUpdateAvatar from "./ProfileUpdateAvatar";
import ProfileUpdateIndex from "./ProfileUpdateIndex";
import ProfileUpdateName from "./ProfileUpdateName";
import ProfileUpdateUsername from "./ProfileUpdateUsername";

const ProfileUpdate = ({ profile }: { profile: IProfile }) => {
  const isUpdating = useAppSelector(
    (state) =>
      state.profile.type === "found" && state.profile.status === "updating"
  );

  return (
    <>
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

      <Dialog open={isUpdating}>
        <Box
          sx={{
            padding: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress sx={{ marginRight: 2 }} />
          <Typography>Updating...</Typography>
        </Box>
      </Dialog>
    </>
  );
};

export default ProfileUpdate;
