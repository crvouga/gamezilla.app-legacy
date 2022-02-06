import { Chat, Home, Person, Search } from "@mui/icons-material";
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  useTheme,
} from "@mui/material";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LinkBehavior } from "./components/Link";
import { onAuthStatus, onProfileStatus } from "./data-access";
import { AccountPage } from "./pages/Account";
import { CreateProfilePage } from "./pages/CreateProfile";
import { DeleteProfilePage } from "./pages/DeleteProfile";
import { EditProfilePage } from "./pages/EditProfile";
import { EditProfileAvatarPage } from "./pages/EditProfileAvatar";
import { EditProfileNamePage } from "./pages/EditProfileName";
import { EditProfileUsernamePage } from "./pages/EditProfileUsername";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { LogoutPage } from "./pages/Logout";
import { SplashPage } from "./pages/Splash";
import { TicTacToePage } from "./pages/TicTacToe";
import { TicTacToeGamePage } from "./pages/TicTacToeGame";
import { useSubscription } from "./utility";

export const App = () => {
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      );

    case "loading":
      return <SplashPage />;

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
      return <SplashPage />;

    case "not-found":
      return (
        <Routes>
          <Route
            path="/profile/create/*"
            element={
              <CreateProfilePage userMetadata={userMetadata} userId={userId} />
            }
          />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="*" element={<Navigate to="/profile/create" />} />
        </Routes>
      );

    case "found":
      const { profile } = profileStatus;

      return (
        <Routes>
          <Route path="/" element={<HomePage profile={profile} />} />
          <Route path="/account" element={<AccountPage profile={profile} />} />
          <Route path="/profile/edit">
            <Route path="" element={<EditProfilePage profile={profile} />} />
            <Route
              path="avatar/*"
              element={<EditProfileAvatarPage profile={profile} />}
            />
            <Route
              path="name"
              element={<EditProfileNamePage profile={profile} />}
            />
            <Route
              path="username"
              element={<EditProfileUsernamePage profile={profile} />}
            />
          </Route>
          <Route path="/logout" element={<LogoutPage />} />
          <Route
            path="/profile/delete"
            element={<DeleteProfilePage userId={profile.userId} />}
          />
          <Route path="/tic-tac-toe" element={<TicTacToePage />} />
          <Route
            path="/tic-tac-toe/game/:gameId"
            element={<TicTacToeGamePage />}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      );
  }
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const [value, setValue] = React.useState(0);

  return (
    <>
      {children}

      <BottomNavigation
        sx={{
          position: "fixed",
          right: 0,
          bottom: 0,
          left: 0,
        }}
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction
          LinkComponent={LinkBehavior}
          label="Home"
          href="/"
          icon={<Home />}
        />
        <BottomNavigationAction
          LinkComponent={LinkBehavior}
          href="/chat"
          label="Chat"
          icon={<Chat />}
        />
        <BottomNavigationAction
          LinkComponent={LinkBehavior}
          href="/search"
          label="Search"
          icon={<Search />}
        />
        <BottomNavigationAction
          LinkComponent={LinkBehavior}
          href="/profile"
          label="Profile"
          icon={<Person />}
        />
      </BottomNavigation>
    </>
  );
};
