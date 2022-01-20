import React from "react";
import { Route, Routes } from "react-router-dom";
import { Alert } from "../Components/Alert";
import { Backdrop } from "../Components/Backdrop";
import { ModalLoader } from "../Components/ModalLoader";
import { EditAvatarPage } from "./pages/EditAvatar";
import { EditProfilePage } from "./pages/EditProfile";
import { HomePage } from "./pages/Home";
import { LoginPage } from "./pages/Login";
import { LogoutPage } from "./pages/Logout";
import { TicTacToePage } from "./pages/TicTacToe";
import { useAuthState } from "./useAuthState";
import { useProfileState } from "./useProfileState";

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
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
};

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
