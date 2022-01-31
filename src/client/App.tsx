import { Chat, Home, Person, Search } from "@mui/icons-material";
import {
  Alert,
  Backdrop,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import React, { useRef } from "react";
import { Route, Routes } from "react-router-dom";
import { LinkBehavior } from "./components/Link";
import { onAuthStatus, onUserStatus } from "./data-access";
import { AccountPage } from "./pages/Account";
import { EditProfilePage } from "./pages/EditProfile";
import { EditProfileAvatarPage } from "./pages/EditProfileAvatar";
import { EditProfileNamePage } from "./pages/EditProfileName";
import { EditProfileUsernamePage } from "./pages/EditProfileUsername";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { LogoutPage } from "./pages/Logout";
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
    {
      type: "loading",
    },
    onUserStatus({ userId })
  );

  if (userStatus.type === "loading") {
    return <Splash />;
  }

  if (userStatus.type === "error") {
    return (
      <Backdrop open>
        <Alert sx={{ m: 4 }} variant="filled" severity="error">
          Something went wrong when trying to load your profile.
        </Alert>
      </Backdrop>
    );
  }

  const { profile } = userStatus;

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RootLayout>
            <HomePage profile={profile} />
          </RootLayout>
        }
      />
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
      <Route path="/logout" element={<LogoutPage profile={profile} />} />
    </Routes>
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
