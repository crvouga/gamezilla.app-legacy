import { writable } from "svelte/store";

type IToast = {
  id: string;
  type: "error";
  message: string;
};

export const errorToToast = (error: Error): IToast => {
  return {
    id: String(Date.now() * Math.random()),
    type: "error",
    message: error.message,
  };
};

export const ToastStore = () => {
  const store = writable<IToast[]>([]);

  return {
    ...store,

    remove: (ids: string[]) => {
      const idSet = new Set(ids);

      store.update((toasts) => {
        return toasts.filter((toast) => !idSet.has(toast.id));
      });
    },

    enqueue: (newToasts: IToast[]) => {
      store.update((toasts) => {
        return [...toasts, ...newToasts];
      });
    },
  };
};
