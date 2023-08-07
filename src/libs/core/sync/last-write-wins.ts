import { Posix } from "../unix-time";

export type Model<T> = T & {
  updatedAt?: Posix;
};

export const reconcile = <T>(client: Model<T>, server: Model<T>): Model<T> => {
  if (!client.updatedAt) {
    return server;
  }

  if (!server.updatedAt) {
    return client;
  }

  if (client.updatedAt > server.updatedAt) {
    return client;
  }

  return server;
};

export const updated = <T>(model: Model<T>): Model<T> => {
  return {
    ...model,
    updatedAt: Posix.fromNumber(Date.now()),
  };
};
