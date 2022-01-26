import { Home, Person } from "@mui/icons-material";
import {
  BottomNavigation,
  BottomNavigationAction,
  Container,
} from "@mui/material";
import React, { useRef } from "react";
import { ReactLocation, Router } from "react-location";
import { Alert, Backdrop } from "./components";
import { onAuthStatus, onUserStatus } from "./data-access";
import {
  EditAvatarPage,
  EditProfilePage,
  HomePage,
  LoginPage,
  LogoutPage,
  TicTacToePage,
} from "./pages";
import { ProfilePage } from "./pages/Profile";
import { Splash } from "./pages/Splash";
import { useSubscription } from "./utility";

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

  const locationRef = useRef(new ReactLocation());

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
      location={locationRef.current}
      routes={[
        {
          path: "/",
          element: (
            <RootLayout>
              <HomePage profile={profile} />
            </RootLayout>
          ),
        },
        {
          path: "/profile",
          element: (
            <RootLayout>
              <ProfilePage profile={profile} />
            </RootLayout>
          ),
        },
        {
          path: "/profile/edit",
          element: (
            <RootLayout>
              <EditProfilePage profile={profile} />
            </RootLayout>
          ),
        },
        {
          path: "/profile/avatar/edit",
          element: (
            <RootLayout>
              <EditAvatarPage profile={profile} />
            </RootLayout>
          ),
        },
        {
          path: "/logout",
          element: <LogoutPage username={profile.username} />,
        },
        {
          path: "/tic-tac-toe",
          element: <TicTacToePage />,
        },
      ]}
    />
  );
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
        <BottomNavigationAction label="Home" href="/" icon={<Home />} />
        <BottomNavigationAction
          href="/profile"
          label="Profile"
          icon={<Person />}
        />
      </BottomNavigation>
    </>
  );
};
