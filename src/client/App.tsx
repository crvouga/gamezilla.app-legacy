import React from "react";
import { Route, Routes } from "react-router-dom";
import { Alert, Backdrop, ModalLoader } from "./components";
import { useAuthStatus, useUserStatus } from "./data-access";
import {
  EditAvatarPage,
  EditProfilePage,
  HomePage,
  LoginPage,
  LogoutPage,
  TicTacToePage,
} from "./pages";

export const App = () => {
  const authState = useAuthStatus();

  if (authState.type === "loading") {
    return <ModalLoader title="Loading..." />;
  }

  if (authState.type === "logged-in") {
    return <LoggedIn userId={authState.userId} />;
  }

  return <LoginPage />;
};

const LoggedIn = ({ userId }: { userId: string }) => {
  const userStatus = useUserStatus({ userId });

  if (userStatus.type === "error") {
    return (
      <Backdrop>
        <Alert variant="error" title="Failed to load your profile" />
      </Backdrop>
    );
  }

  if (userStatus.type === "loading") {
    return <ModalLoader title="Loading..." />;
  }

  const { profile } = userStatus;

  return (
    <Routes>
      <Route path="/logout" element={<LogoutPage />} />
      <Route
        path="/edit/profile"
        element={<EditProfilePage profile={profile} />}
      />
      <Route
        path="/edit/profile/avatar"
        element={<EditAvatarPage profile={profile} />}
      />
      <Route path="/tic-tac-toe" element={<TicTacToePage />} />
      <Route path="*" element={<HomePage profile={profile} />} />
    </Routes>
  );
};
