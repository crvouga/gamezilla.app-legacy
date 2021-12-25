import React, { createContext, useContext } from "react";
import { IProfile } from "./profile";

const ProfileContext = createContext<IProfile | null>(null);

export const ProfileContextProvider = ({
  profile,
  children,
}: {
  profile: IProfile;
  children: React.ReactNode;
}) => {
  return (
    <ProfileContext.Provider value={profile}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const profile = useContext(ProfileContext);

  if (profile) {
    return profile;
  }

  throw new Error("Using hook outsite of context");
};
