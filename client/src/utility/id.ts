import { v4 as uuidv4 } from "uuid";

export const generateId = (): string => {
  return String(Math.random());
};

export type IUuidv4 = string & { type: "Uuidv4" };

export const generateUuidv4 = () => {
  return uuidv4() as IUuidv4;
};
