export type ToBackend = {
  frontendId: string;
  type: "LOGIN";
  method: "PHONE_NUMBER";
  phoneNumber: string;
};

export type ToFrontend = {
  frontendId: string;
  type: "LOGGED_IN";
  userId: string;
};
