import { selectors } from "../../features";
import { useSelector } from "react-redux";

export const useAuthProfile = () => {
  const authSlice = useSelector(selectors.auth.state);
  const profileSlice = useSelector(selectors.profile.slice);

  if (authSlice.type === "signed-in" && profileSlice.type === "loaded") {
    return profileSlice.profile;
  }

  throw new Error(
    "Can not use auth profile when not signed in or profile is not loaded"
  );
};
