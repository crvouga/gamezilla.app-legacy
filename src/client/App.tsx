import React from "react";
import { ReactLocation, Router } from "react-location";
import { Alert, Backdrop, ModalLoader } from "./components";
import { onAuthStatus, onUserStatus } from "./data-access";
import {
  EditAvatarPage,
  EditProfilePage,
  HomePage,
  LoginPage,
  LogoutPage,
  TicTacToePage,
} from "./pages";
import { Splash } from "./pages/Splash";
import { useSubscription } from "./utility";

const location = new ReactLocation();

export const App = () => {
  const authState = useSubscription({ type: "loading" }, onAuthStatus);

  if (authState.type === "loading") {
    return <Splash />;
  }

  if (authState.type === "logged-out") {
    return <LoginPage />;
  }

  return <LoggedIn userId={authState.userId} />;
};

const LoggedIn = ({ userId }: { userId: string }) => {
  const userStatus = useSubscription(
    { type: "loading" },
    onUserStatus({ userId })
  );

  if (userStatus.type === "loading") {
    return <Splash />;
  }

  if (userStatus.type === "error") {
    return (
      <Backdrop>
        <Alert variant="error" title="Failed to load your profile" />
      </Backdrop>
    );
  }

  const { profile } = userStatus;

  return (
    <Router
      location={location}
      routes={[
        {
          path: "/logout",
          element: <LogoutPage />,
        },
        {
          path: "/profile/edit",
          element: <EditProfilePage profile={profile} />,
        },
        {
          path: "/profile/avatar/edit",
          element: <EditAvatarPage profile={profile} />,
        },
        {
          path: "/tic-tac-toe",
          element: <TicTacToePage />,
        },
        {
          path: "/",
          element: <HomePage profile={profile} />,
        },
      ]}
    />
  );
};
