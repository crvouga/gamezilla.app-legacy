import { AuthStore } from "./auth";
import { ToastStore } from "./toast";

export const Stores = () => {
  return {
    auth: AuthStore(),
    toast: ToastStore(),
  };
};
