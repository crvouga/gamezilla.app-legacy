import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Account from "./features/account/Account";
import { onAuthState } from "./features/account/account-data-access";
import AccountLogin from "./features/account/AccountLogin";
import AccountLogout from "./features/account/AccountLogout";
import Game from "./features/game/Game";
import Home from "./features/home/Home";
import Profile from "./features/profile/Profile";
import ProfileCreate from "./features/profile/profile-create/ProfileCreate";
import { IProfile, onProfile } from "./features/profile/profile-data-access";
import ThemeProvider from "./features/theme/ThemeProvider";
import { useSubscription } from "./utils";

export const App = () => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <ThemeProvider>
          <Layout>
            <LoadAuth />
          </Layout>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const LoadAuth = () => {
  const subscription = useSubscription(onAuthState);

  if (subscription.status === "loading") {
    return <Splash />;
  }

  const authState = subscription.data;

  if (authState.type === "logged-in") {
    return (
      <LoadProfile
        defaultName={authState.userMetadata.name ?? ""}
        userId={authState.userId}
      />
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<AccountLogin />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const LoadProfile = ({
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
    return <LoadGameRoom profile={profile} />;
  }

  return (
    <Routes>
      <Route
        path="/profile/create/*"
        element={<ProfileCreate defaultName={defaultName} userId={userId} />}
      />
      <Route path="/logout" element={<AccountLogout />} />
      <Route path="*" element={<Navigate to="/profile/create" replace />} />
    </Routes>
  );
};

const LoadGameRoom = ({ profile }: { profile: IProfile }) => {
  return (
    <Routes>
      <Route path="/" element={<Home profile={profile} />} />
      <Route path="/account/*" element={<Account />} />
      <Route path="/profile/*" element={<Profile profile={profile} />} />
      <Route path="/game/*" element={<Game />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 *
 *
 *
 *
 *
 *
 *
 *
 */

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
