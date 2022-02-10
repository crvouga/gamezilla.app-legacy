import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { usePersistedState } from "./utility/use-persisted-state";
import Account from "./features/account/Account";
import { onAuthStatus } from "./features/account/account-data-access";
import AccountLogin from "./features/account/AccountLogin";
import AccountLogout from "./features/account/AccountLogout";
import GameSession from "./features/game/GameSession";
import Home from "./features/home/Home";
import { onProfileStatus } from "./features/profile/profile-data-access";
import ProfileCreate from "./features/profile/ProfileCreate";
import ProfileDelete from "./features/profile/ProfileDelete";
import ProfileUpdate from "./features/profile/ProfileUpdate";
import ProfileUpdateAvatar from "./features/profile/ProfileUpdateAvatar";
import ProfileUpdateName from "./features/profile/ProfileUpdateName";
import ProfileUpdateUsername from "./features/profile/ProfileUpdateUsername";
import ThemeProvider, {
  useThemeModeContext,
} from "./features/theme/ThemeProvider";
import ThemeUpdate from "./features/theme/ThemeUpdate";
import { useSubscription } from "./utility/use-subscription";

const App = () => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <ThemeProvider>
          <Layout>
            <SubscribeAuth />
          </Layout>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const SubscribeAuth = () => {
  const authStatus = useSubscription({ type: "loading" }, onAuthStatus);

  switch (authStatus.type) {
    case "logged-out":
      return (
        <Routes>
          <Route path="/login" element={<AccountLogin />} />
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
          <Route path="/logout" element={<AccountLogout />} />
          <Route path="*" element={<Navigate to="/profile/create" />} />
        </Routes>
      );

    case "found":
      const { profile } = profileStatus;

      return <FoundProfile profile={profile} />;
  }
};

const FoundProfile = ({
  profile,
}: {
  profile: {
    userId: string;
    avatarUrl?: string;
    name?: string;
    username?: string;
    themeMode: "LIGHT" | "DARK" | "SYSTEM";
  };
}) => {
  const { themeMode, setThemeMode } = useThemeModeContext();

  useEffect(() => {
    setThemeMode(profile.themeMode);
  }, [profile.themeMode]);

  return (
    <Routes>
      <Route path="/" element={<Home profile={profile} />} />
      <Route path="/account" element={<Account profile={profile} />} />
      <Route
        path="/theme/update"
        element={<ThemeUpdate themeMode={themeMode} profile={profile} />}
      />

      <Route path="/profile/edit">
        <Route path="" element={<ProfileUpdate profile={profile} />} />
        <Route
          path="avatar/*"
          element={<ProfileUpdateAvatar profile={profile} />}
        />
        <Route path="name" element={<ProfileUpdateName profile={profile} />} />
        <Route
          path="username"
          element={<ProfileUpdateUsername profile={profile} />}
        />
      </Route>
      <Route path="/logout" element={<AccountLogout />} />
      <Route
        path="/profile/delete"
        element={<ProfileDelete userId={profile.userId} />}
      />

      <Route path="/game-session/:gameSessionId" element={<GameSession />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

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

const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  if (isSmallScreen) {
    return (
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        margin: "auto",
        width: "100%",
        maxWidth: theme.breakpoints.values.sm,
        height: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "1rem",
          backgroundColor: theme.palette.background.default,
          width: "100%",
          height: "100%",
          maxHeight: theme.breakpoints.values.sm * 1.1,
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default App;
