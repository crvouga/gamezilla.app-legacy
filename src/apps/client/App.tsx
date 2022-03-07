import { useSubscription } from "@libs/utility";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Account from "./features/account/Account";
import { onAuthState } from "./features/account/account-data-access";
import AccountLogin from "./features/account/AccountLogin";
import AccountLogout from "./features/account/AccountLogout";
import GameSession from "./features/game/GameSession";
import Home from "./features/home/Home";
import { IProfile, onProfile } from "./features/profile/profile-data-access";
import ProfileCreate from "./features/profile/ProfileCreate";
import ProfileDelete from "./features/profile/ProfileDelete";
import ProfileUpdate from "./features/profile/ProfileUpdate";
import ProfileUpdateAvatar from "./features/profile/ProfileUpdateAvatar";
import ProfileUpdateName from "./features/profile/ProfileUpdateName";
import ProfileUpdateUsername from "./features/profile/ProfileUpdateUsername";
import ThemeProvider from "./features/theme/ThemeProvider";

export const App = () => {
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
  const subscription = useSubscription(onAuthState);

  if (subscription.status === "loading") {
    return <Splash />;
  }

  const authState = subscription.data;

  if (authState.type === "logged-out") {
    return (
      <Routes>
        <Route path="/login" element={<AccountLogin />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <SubscribeProfile
      defaultName={authState.userMetadata.name ?? ""}
      userId={authState.userId}
    />
  );
};

const SubscribeProfile = ({
  userId,
  defaultName,
}: {
  defaultName: string;
  userId: string;
}) => {
  const subscription = useSubscription(onProfile({ userId }));

  if (subscription.status === "loading") {
    return <Splash />;
  }

  const profile = subscription.data;

  if (profile) {
    return <FoundProfile profile={profile} />;
  }

  return (
    <Routes>
      <Route
        path="/profile/create/*"
        element={<ProfileCreate defaultName={defaultName} userId={userId} />}
      />
      <Route path="/logout" element={<AccountLogout />} />
      <Route path="*" element={<Navigate to="/profile/create" />} />
    </Routes>
  );
};

const FoundProfile = ({ profile }: { profile: IProfile }) => {
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
        maxWidth: 500,
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
          maxHeight: 500 * (16 / 9),
          overflow: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
