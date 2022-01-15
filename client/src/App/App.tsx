import { BackdropLoader, BackdropLoaderTitle } from "Components/BackdropLoader";
import React from "react";
import { LoggedInApp } from "./LoggedIn/LoggedInApp";
import { LoggedOutApp } from "./LoggedOut/LoggedOutApp";
import { useLoginSession } from "./useLoginSession";

export const App = () => {
  const loginSession = useLoginSession();

  switch (loginSession.type) {
    case "loading":
      return (
        <BackdropLoader>
          <BackdropLoaderTitle>Loading...</BackdropLoaderTitle>
        </BackdropLoader>
      );

    case "logged-in":
      return <LoggedInApp userId={loginSession.userId} />;

    case "logged-out":
      return <LoggedOutApp />;
  }
};
