import { ModalLoader } from "src/Components/ModalLoader";
import React from "react";
import { LoggedInApp } from "./LoggedIn/LoggedInApp";
import { LoggedOutApp } from "./LoggedOut/LoggedOutApp";
import { useLoginSession } from "./useLoginSession";

export const App = () => {
  const loginSession = useLoginSession();

  switch (loginSession.type) {
    case "loading":
      return <ModalLoader title="Loading..." subtitle="Checking login" />;

    case "logged-in":
      return <LoggedInApp userId={loginSession.userId} />;

    case "logged-out":
      return <LoggedOutApp />;
  }
};
