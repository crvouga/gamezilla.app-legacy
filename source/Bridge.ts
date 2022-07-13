import { Fullstack } from "Core";
import { ToBackend, ToFrontend } from "Types";

export const sendToFrontend = (clientId: string, msg: ToFrontend) => {
  return Fullstack.sendToFrontend<ToFrontend>(clientId, msg);
};

export const broadcast = (msg: ToFrontend) => {
  return Fullstack.broadcast<ToFrontend>(msg);
};

export const sendToBackend = (msg: ToBackend) => {
  return Fullstack.sendToBackend<ToBackend>(msg);
};
