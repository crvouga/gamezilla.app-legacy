import { Container } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { auth } from "./auth/auth";
import { HomePage } from "./pages";
import { AccountPage } from "./pages/account";
import { GameCreatePage } from "./pages/game/create";
import { GameIdPage } from "./pages/game/[id]";
import { SignInPage } from "./pages/sign-in";
import { SignOutPage } from "./pages/sign-out";

export default function App() {
  const authState = useSelector(auth.selectors.slice);

  return (
    <Container maxWidth="xs" disableGutters>
      {auth.actions.signedOut.match(authState) && <SignInPage />}

      {auth.actions.signedIn.match(authState) && (
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/create" element={<GameCreatePage />} />
          <Route path="/game/:id" element={<GameIdPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-out" element={<SignOutPage />} />
        </Routes>
      )}
    </Container>
  );
}
