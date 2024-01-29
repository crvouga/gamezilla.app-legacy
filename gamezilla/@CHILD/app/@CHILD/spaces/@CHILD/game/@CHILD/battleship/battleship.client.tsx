import { MsgClient, ClientModel, initShared } from "./battleship.core";

export const init = initShared;

export const View = (_props: {
  model: ClientModel;
  dispatch: (msg: MsgClient) => void;
}) => {
  return <div>battleship</div>;
};
