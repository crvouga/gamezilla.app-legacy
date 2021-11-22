import {
  IGetElseCreateProfile,
  IOnProfile,
  ISetProfile,
} from "../core/profile/profile";

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

export const getElseCreateProfile: IGetElseCreateProfile = async ({
  userId,
}) => {
  console.log({ getElseCreateProfile: userId });
  return {
    userId,
    name: "hello",
    avatarUrl: "hello",
  };
};
