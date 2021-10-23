import { removeToast } from "./remove-toast";
import type { IToast } from "./toast-store";
import { toastStore } from "./toast-store";

export const addToast = (toasts: IToast[]) => {
  setTimeout(() => {
    const ids = toasts.map((toast) => toast.id);
    removeToast(ids);
  }, 3000);

  toastStore.update((previousToasts) => {
    return [...previousToasts, ...toasts];
  });
};
