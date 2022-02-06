import { Box, useTheme } from "@mui/material";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { onAuthStatus, onProfileStatus } from "./data-access";
import { useSubscription } from "./utility";

const Account = React.lazy(() => import("./pages/Account"));
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Logout = React.lazy(() => import("./pages/Logout"));
const ProfileCreate = React.lazy(() => import("./pages/ProfileCreate"));
const ProfileDelete = React.lazy(() => import("./pages/ProfileDelete"));
const ProfileUpdate = React.lazy(() => import("./pages/ProfileUpdate"));
const ProfileUpdateAvatar = React.lazy(
  () => import("./pages/ProfileUpdateAvatar")
);
const ProfileUpdateName = React.lazy(() => import("./pages/ProfileUpdateName"));
const ProfileUpdateUsername = React.lazy(
  () => import("./pages/ProfileUpdateUsername")
);
const Splash = React.lazy(() => import("./pages/Splash"));
const TicTacToe = React.lazy(() => import("./pages/TicTacToe"));
const TicTacToeGame = React.lazy(() => import("./pages/TicTacToeGame"));

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
