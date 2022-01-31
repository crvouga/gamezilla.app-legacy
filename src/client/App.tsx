import { Chat, Home, Person, Search } from "@mui/icons-material";
import {
  Alert,
  Backdrop,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import React, { useRef } from "react";
import { useMutation, useQuery } from "react-query";
import { Route, Routes } from "react-router-dom";
import { LinkBehavior } from "./components/Link";
import {
  IAuthStatus,
  getAuthStatus,
  onAuthStatus,
  onUserStatus,
  IUserStatus,
  getElseCreateProfile,
} from "./data-access";
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
  return <LoadAuth />;
};

const LoadAuth = () => {
  const query = useQuery(["auth"], getAuthStatus);

  if (query.status === "success") {
    return <SubscribeAuth initial={query.data} />;
  }

  return <Splash />;
};

const SubscribeAuth = ({ initial }: { initial: IAuthStatus }) => {
  const authStatus = useSubscription(initial, onAuthStatus);

  if (authStatus.type === "logged-out") {
    return <LoginPage />;
  }

  return <LoadUser userId={authStatus.userId} />;
};

const LoadUser = ({ userId }: { userId: string }) => {
  const query = useQuery(["user-status"], () =>
    getElseCreateProfile({ userId })
  );

  if (query.status === "success") {
    return <SubscribeUser initial={query.data} />;
  }

  return <Splash />;
};

const SubscribeUser = ({ initial }: { initial: IUserStatus }) => {
  const userStatus = useSubscription(
    initial,
    onUserStatus({ userId: initial.userId })
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          <RootLayout>
            <HomePage profile={userStatus} />
          </RootLayout>
        }
      />
      <Route path="/account" element={<AccountPage profile={userStatus} />} />
      <Route path="/profile/edit">
        <Route path="" element={<EditProfilePage profile={userStatus} />} />
        <Route
          path="avatar/*"
          element={<EditProfileAvatarPage profile={userStatus} />}
        />
        <Route
          path="name"
          element={<EditProfileNamePage profile={userStatus} />}
        />
        <Route
          path="username"
          element={<EditProfileUsernamePage profile={userStatus} />}
        />
      </Route>
      <Route path="/logout" element={<LogoutPage profile={userStatus} />} />
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
