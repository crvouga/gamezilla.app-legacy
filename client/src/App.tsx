import { Container } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { auth } from "src/features";
import { HomePage } from "./pages";
import { AccountPage } from "./pages/account";
import { GameIdPage } from "./pages/game/:id";
import { ProfilePage } from "./pages/profile/:userId";
import { SignInPage } from "./pages/sign-in";
import { SignOutPage } from "./pages/sign-out";

const RequireAuth = ({
  children,
  fallback,
}: {
  fallback: React.ReactNode;
  children: React.ReactNode;
}) => {
  const authState = useSelector(auth.selectors.slice);

  if (auth.actions.signedIn.match(authState)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default function App() {
  return (
    <Container maxWidth="xs" disableGutters>
      <RequireAuth fallback={<SignInPage />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:id" element={<GameIdPage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-out" element={<SignOutPage />} />
        </Routes>
      </RequireAuth>
    </Container>
  );
}
