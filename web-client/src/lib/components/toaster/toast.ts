export type IToast = {
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
