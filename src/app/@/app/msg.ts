type AnyMsg = {
  t: string;
  c?: AnyMsg;
};

export type MsgMetaData = Partial<{
  initiatorMsg: AnyMsg;
}>;
