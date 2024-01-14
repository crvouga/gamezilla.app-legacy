import { ClientMsg, ClientModel, initShared } from "./battleship.core";

export const init = initShared;

export const View = (props: {
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  return <div>battleship</div>;
};
