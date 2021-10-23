import { toastStore } from "./toast-store";

export const removeToast = (ids: string[]) => {
  const idSet = new Set(ids);

  toastStore.update((toasts) => {
    return toasts.filter((toast) => !idSet.has(toast.id));
  });
};
