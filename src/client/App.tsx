import { Box, useTheme } from "@mui/material";
import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { onAuthStatus, onProfileStatus } from "./data-access";
import Account from "./pages/Account";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import ProfileCreate from "./pages/ProfileCreate";
import ProfileDelete from "./pages/ProfileDelete";
import ProfileUpdate from "./pages/ProfileUpdate";
import ProfileUpdateAvatar from "./pages/ProfileUpdateAvatar";
import ProfileUpdateName from "./pages/ProfileUpdateName";
import ProfileUpdateUsername from "./pages/ProfileUpdateUsername";
import Splash from "./pages/Splash";
import TicTacToe from "./pages/TicTacToe";
import TicTacToeGame from "./pages/TicTacToeGame";
import { useSubscription } from "./utility";

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
          <Route
            path="/login"
            element={
              <Suspense fallback={<Splash />}>
                <Login />
              </Suspense>
            }
          />
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
