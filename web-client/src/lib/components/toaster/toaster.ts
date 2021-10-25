import { generateUniqueId, innerJoin } from "$lib/utility";
import type { IToast } from "./toast";

type IPartialToast = {
  message: IToast["message"];
  id?: IToast["id"];
  type?: IToast["type"];
};

const partialToastToToast = (partialToast: IPartialToast): IToast => {
  return {
    ...partialToast,
    id: partialToast.id ?? generateUniqueId(),
    type: partialToast.type ?? "success",
  };
};

export const Toaster = ({
  setState,
  defaultDuration,
}: {
  setState: (set: (toasts: IToast[]) => IToast[]) => void;
  defaultDuration: number;
}) => {
  const dequeueToast = (ids: string[]) => {
    setState((toasts) =>
      innerJoin((toast, id) => toast.id !== id, toasts, ids)
    );
  };

  const enqueueToast = (
    partialToasts: IPartialToast[],
    overrides?: {
      duration: number;
    }
  ) => {
    const toasts = partialToasts.map(partialToastToToast);

    const duration = overrides?.duration ?? defaultDuration;

    if (duration && duration !== Infinity) {
      setTimeout(() => {
        const ids = toasts.map((toast) => toast.id);
        dequeueToast(ids);
      }, duration);
    }

    setState((previousToasts) => [...previousToasts, ...toasts]);
  };

  return {
    enqueueToast,
    dequeueToast,
  };
};
