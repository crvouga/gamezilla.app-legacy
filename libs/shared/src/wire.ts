export type SendToBackend<TMsg> = {
  t: 'send-to-backend';
  msg: TMsg;
};

export type SendToFrontend<TMsg> = {
  t: 'send-to-frontend';
  msg: TMsg;
};

export type SendToClient<TMsg> = {
  t: 'send-to-client';
  msg: TMsg;
};

export type SendToRoom<TMsg> = {
  t: 'send-to-room';
  msg: TMsg;
};
