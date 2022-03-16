import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { IState } from "./app-state";
import { IAppDispatch, useAppDispatch, useAppSelector } from "./app-store";
import AccountLogin from "./features/account/AccountLogin";
import AccountLogout from "./features/account/AccountLogout";
import AccountRoutes from "./features/account/AccountRoutes";
import GameConnectedRoutes from "./features/game/GameConnectedRoutes";
import GameDisconnectedRoutes from "./features/game/GameDisconnectedRoutes";
import Home from "./features/home/Home";
import { IProfile } from "./features/profile/profile-data-access";
import ProfileCreate from "./features/profile/ProfileCreate";
import ProfileRoutes from "./features/profile/ProfileRoutes";

const App = () => {
  const state = useAppSelector((state) => state);

  const dispatch = useAppDispatch();
  return (
    <Layout>
      <LoadAccount dispatch={dispatch} state={state} />
    </Layout>
  );
};

const LoadAccount = ({
  state,
  dispatch,
}: {
  dispatch: IAppDispatch;
  state: IState;
}) => {
  if (state.account.type === "loading") {
    return <Splash subtitle="Checking if logged in..." />;
  }

  if (state.account.type === "logged-in") {
    return (
      <LoadProfile
        dispatch={dispatch}
        userId={state.account.userId}
        state={state}
      />
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={<AccountLogin state={state.account} dispatch={dispatch} />}
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const LoadProfile = ({
  dispatch,
  userId,
  state,
}: {
  userId: string;
  state: IState;
  dispatch: IAppDispatch;
}) => {
  if (state.profile.type === "loading") {
    return <Splash subtitle="Loading profile..." />;
  }

  if (state.profile.type === "found") {
    return (
      <LoadGameRoom
        dispatch={dispatch}
        profile={state.profile.profile}
        state={state}
      />
    );
  }

  return (
    <Routes>
      <Route
        path="/profile/create/*"
        element={<ProfileCreate defaultName={""} userId={userId} />}
      />
      <Route
        path="/logout"
        element={<AccountLogout state={state.account} dispatch={dispatch} />}
      />
      <Route path="*" element={<Navigate to="/profile/create" replace />} />
    </Routes>
  );
};

const LoadGameRoom = ({
  state,
  profile,
  dispatch,
}: {
  state: IState;
  profile: IProfile;
  dispatch: IAppDispatch;
}) => {
  console.log({ state });

  if (state.game.type === "loading") {
    return <Splash subtitle="Checking if in a game..." />;
  }

  if (state.game.type === "connected") {
    return (
      <Routes>
        <Route
          path="/game/*"
          element={<GameConnectedRoutes dispatch={dispatch} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home profile={profile} />} />
      <Route
        path="/account/*"
        element={<AccountRoutes state={state.account} dispatch={dispatch} />}
      />
      <Route path="/profile/*" element={<ProfileRoutes profile={profile} />} />
      <Route
        path="/game/*"
        element={<GameDisconnectedRoutes dispatch={dispatch} />}
      />
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
