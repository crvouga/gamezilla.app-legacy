import { useSelector } from "react-redux";
import { selectors } from "@gamezilla/core";

export const useAuthSlice = () => {
  return useSelector(selectors.auth.state);
};

export const useProfileSlice = () => {
  return useSelector(selectors.profile.slice);
};

export const useAuthProfile = () => {
  const authSlice = useAuthSlice();
  const profileSlice = useProfileSlice();

  if (authSlice.type === "signed-in" && profileSlice.type === "loaded") {
    return profileSlice.profile;
  }

  throw new Error(
    "Can not use auth profile when not signed in or profile loaded"
  );
};
