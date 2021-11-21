import { IOnProfile, ISetProfile } from "../core/profile";

export const onProfile: IOnProfile =
  ({ userId }) =>
  (set) => {
    setTimeout(() => {
      set({
        userId,
        name: "hello",
        avatarUrl: "hello",
      });
    }, 200);
    return () => {};
  };

export const setProfile: ISetProfile = async (profile) => {
  console.log({ setProfile: profile });
};
