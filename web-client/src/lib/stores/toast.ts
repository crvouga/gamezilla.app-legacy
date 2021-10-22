import { writable } from "svelte/store";

type IToast = {
  id: string;
  type: "error" | "success";
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
  const remove = (ids: string[]) => {
    const idSet = new Set(ids);

    store.update((toasts) => {
      return toasts.filter((toast) => !idSet.has(toast.id));
    });
  };
  return {
    ...store,

    remove,

    enqueue: (newToasts: IToast[]) => {
      setTimeout(() => {
        remove(newToasts.map((toast) => toast.id));
      }, 3000);

      store.update((toasts) => {
        return [...toasts, ...newToasts];
      });
    },
  };
};
