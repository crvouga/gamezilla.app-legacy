import { PhoneNumber, Result, Sub } from "gamezilla/@SHARED/core";
import { UserId } from "gamezilla/app/@SHARED/data";

export type AuthService = {
  logout: () => Promise<Result<string, null>>;

  getCurrentUser: () => Promise<Result<string, { userId: UserId } | null>>;

  currentUserSub: Sub<{ userId: UserId } | null>;

  loginWithProvider: ({
    provider,
  }: {
    provider: "google";
  }) => Promise<Result<string, null>>;

  sendCode: (input: {
    phoneNumber: PhoneNumber;
  }) => Promise<Result<string, null>>;

  verifyCode: (input: {
    phoneNumber: PhoneNumber;
    code: string;
  }) => Promise<Result<string, null>>;

  sendEmailLink: (input: {
    emailAddress: string;
  }) => Promise<Result<string, null>>;
};
