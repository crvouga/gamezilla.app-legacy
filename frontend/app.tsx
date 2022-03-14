import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { onAuthState } from "./features/account/account-data-access";
import AccountLogin from "./features/account/AccountLogin";
import AccountLogout from "./features/account/AccountLogout";
import AccountRoutes from "./features/account/AccountRoutes";
import * as Game from "./features/game/game-state";
import GameConnectedRoutes from "./features/game/GameConnectedRoutes";
import GameDisconnectedRoutes from "./features/game/GameDisconnectedRoutes";
import Home from "./features/home/Home";
import ProfileCreate from "./features/profile/profile-create/ProfileCreate";
import { IProfile, onProfile } from "./features/profile/profile-data-access";
import ProfileRoutes from "./features/profile/ProfileRoutes";
import { IAppDispatch, IAppState, useAppSelector } from "./app-store";
import { useSubscription } from "./utils";

const App = ({
  appState,
  appDispatch,
}: {
  appDispatch: IAppDispatch;
  appState: IAppState;
}) => {
  return (
    <Layout>
      <LoadAuth appState={appState} />
    </Layout>
  );
};

const LoadAuth = ({ appState }: { appState: IAppState }) => {
  if (appState.account.type === "loading") {
    return <Splash subtitle="Checking if logged in..." />;
  }

  if (appState.account.type === "logged-in") {
    return (
      <LoadProfile
        defaultName={appState.account.name ?? ""}
        userId={appState.account.userId}
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
  defaultName,
  userId,
}: {
  defaultName: string;
  userId: string;
}) => {
  const profile = useAppSelector((state) => state.profile);

  if (profile.type === "loading") {
    return <Splash subtitle="Loading profile..." />;
  }

  if (profile.type === "found") {
    return <LoadGameRoom profile={profile.profile} />;
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
  const gameState = useAppSelector((state) => state.game);

  if (gameState.type === "loading") {
    return <Splash subtitle="Checking if in a game..." />;
  }

  if (gameState.type === "connected") {
    return (
      <Routes>
        <Route path="/game/*" element={<GameConnectedRoutes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home profile={profile} />} />
      <Route path="/account/*" element={<AccountRoutes />} />
      <Route path="/profile/*" element={<ProfileRoutes profile={profile} />} />
      <Route path="/game/*" element={<GameDisconnectedRoutes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const Splash = ({ subtitle }: { subtitle: string }) => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h3" color="primary.main">
          Gamezilla
        </Typography>
        <Typography align="center" variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
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

export default App;
