import React from "react";
import { Route, Routes } from "react-router-dom";
import { Alert, Backdrop, ModalLoader } from "./components";
import { useAuthState, useProfileState } from "./data-access";
import {
  EditAvatarPage,
  EditProfilePage,
  HomePage,
  LoginPage,
  LogoutPage,
  TicTacToePage,
} from "./pages";

export const App = () => {
  const authState = useAuthState();

  if (authState.type === "loading") {
    return <ModalLoader title="Loading..." />;
  }

  if (authState.type === "logged-in") {
    return <LoggedIn userId={authState.userId} />;
  }

  return <LoginPage />;
};

const LoggedIn = ({ userId }: { userId: string }) => {
  const profileState = useProfileState({ userId });

  if (profileState.type === "error") {
    return (
      <Backdrop>
        <Alert variant="error" title="Failed to load your profile" />
      </Backdrop>
    );
  }

  if (profileState.type === "loading") {
    return <ModalLoader title="Loading..." />;
  }

  const { profile } = profileState;

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
