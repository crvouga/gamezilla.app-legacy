import { io } from "socket.io-client";

const socket = io("http://localhost:8000/");

type Channel = {
  type: "TIC_TAC_TOE_GAME";
  gameId: string;
};

export const subscribe = (channelKey: string, handler: Function) => {
  socket.emit("subscribe", { channelKey });

  const filterdHandler = (message: any) => {
    if (message.channel == channelKey) {
      handler(message);
    }
  };

  socket.on(channelKey, filterdHandler);

  return () => {
    socket.emit("unsubscribe", { channelKey });
  };
};

export const publish = (channelId: string, message: any) => {
  socket.emit("publish", { channelId, message });
};
