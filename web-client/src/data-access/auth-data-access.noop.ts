import type { IAuthDataAccess } from "./auth-data-access.interface";

export const AuthDataAccessNoop = (): IAuthDataAccess => {
  return {
    async authenticate() {
      return [];
    },

    async unauthenticate() {},

    onAuthStateChanged() {
      return () => {};
    },
  };
};
