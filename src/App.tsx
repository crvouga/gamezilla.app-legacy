import { Box, Typography, useTheme } from "@mui/material";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Account from "./features/account/Account";
import { onAuthStatus } from "./features/account/account-data-access";
import Login from "./features/account/AccountLogin";
import Logout from "./features/account/AccountLogout";
import TicTacToe from "./features/tic-tac-toe/TicTacToe";
import TicTacToeGame from "./features/tic-tac-toe/TicTacToeSession";
import Home from "./features/home/Home";
import { onProfileStatus } from "./features/profile/profile-data-access";
import ProfileCreate from "./features/profile/ProfileCreate";
import ProfileDelete from "./features/profile/ProfileDelete";
import ProfileUpdate from "./features/profile/ProfileUpdate";
import ProfileUpdateAvatar from "./features/profile/ProfileUpdateAvatar";
import ProfileUpdateName from "./features/profile/ProfileUpdateName";
import ProfileUpdateUsername from "./features/profile/ProfileUpdateUsername";
import { useSubscription } from "./utility/use-subscription";

const Splash = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Typography variant="h3" color="primary.main">
        Gamezilla
      </Typography>
    </Box>
  );
};

const App = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        margin: "auto",
        maxWidth: theme.breakpoints.values.sm,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SubscribeAuth />
    </Box>
  );
};

const SubscribeAuth = () => {
  const authStatus = useSubscription({ type: "loading" }, onAuthStatus);

  switch (authStatus.type) {
    case "logged-out":
      return (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      );

    case "loading":
      return <Splash />;

    case "logged-in":
      const { userId, userMetadata } = authStatus;
      return <SubscribeProfile userMetadata={userMetadata} userId={userId} />;
  }
};

const SubscribeProfile = ({
  userId,
  userMetadata,
}: {
  userMetadata: {
    name?: string;
  };
  userId: string;
}) => {
  const profileStatus = useSubscription(
    { type: "loading" },
    onProfileStatus({ userId })
  );

  switch (profileStatus.type) {
    case "loading":
      return <Splash />;

    case "not-found":
      return (
        <Routes>
          <Route
            path="/profile/create/*"
            element={
              <ProfileCreate userMetadata={userMetadata} userId={userId} />
            }
          />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<Navigate to="/profile/create" />} />
        </Routes>
      );

    case "found":
      const { profile } = profileStatus;

      return (
        <Routes>
          <Route path="/" element={<Home profile={profile} />} />
          <Route path="/account" element={<Account profile={profile} />} />
          <Route path="/profile/edit">
            <Route path="" element={<ProfileUpdate profile={profile} />} />
            <Route
              path="avatar/*"
              element={<ProfileUpdateAvatar profile={profile} />}
            />
            <Route
              path="name"
              element={<ProfileUpdateName profile={profile} />}
            />
            <Route
              path="username"
              element={<ProfileUpdateUsername profile={profile} />}
            />
          </Route>
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/profile/delete"
            element={<ProfileDelete userId={profile.userId} />}
          />
          <Route path="/tic-tac-toe" element={<TicTacToe />} />
          <Route path="/tic-tac-toe/game/:gameId" element={<TicTacToeGame />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      );
  }
};

export default App;
