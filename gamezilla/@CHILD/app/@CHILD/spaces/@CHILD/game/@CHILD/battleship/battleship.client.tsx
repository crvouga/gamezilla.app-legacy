import { ClientMsg, ClientModel, initShared } from "./battleship.core";

export const init = initShared;

export const View = (_props: {
  model: ClientModel;
  emit: (msg: ClientMsg) => void;
}) => {
  return <div>battleship</div>;
};
