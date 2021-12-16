import { Container } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { auth } from "./auth/auth";
import { HomePage } from "./pages";
import { GameCreatePage } from "./pages/game/create";
import { GameIdPage } from "./pages/game/[id]";
import { SignInPage } from "./pages/sign-in";

export default function App() {
  const authState = useSelector(auth.selectors.slice);

  if (auth.actions.signedOut.match(authState)) {
    return (
      <Container maxWidth="xs" disableGutters>
        <SignInPage />
      </Container>
    );
  }

  return (
    <Container maxWidth="xs" disableGutters>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/create" element={<GameCreatePage />} />
        <Route path="/game/:id" element={<GameIdPage />} />
      </Routes>
    </Container>
  );
}
