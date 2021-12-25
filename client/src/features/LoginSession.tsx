import React, { createContext, useContext } from "react";
import { IProfile } from "./profile/profile";

type ILoginSession = {
  profile: IProfile;
};

const LoginSessionContext = createContext<ILoginSession | null>(null);

export const LoginSessionProvider = ({
  loginSession,
  children,
}: {
  loginSession: ILoginSession;
  children: React.ReactNode;
}) => {
  return (
    <LoginSessionContext.Provider value={loginSession}>
      {children}
    </LoginSessionContext.Provider>
  );
};

export const useLoginSession = () => {
  const loginSession = useContext(LoginSessionContext);

  if (loginSession) {
    return loginSession;
  }

  throw new Error(
    "Trying to use login session context when outside of provider"
  );
};
