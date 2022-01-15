import { Backdrop } from "./Backdrop";

const classNames = {
  action: "flex-1 p-4 text-sm uppercase hover:bg-gray-200",
};

export const ModalConformation = ({
  title,
  left,
  right,
}: {
  title: string;
  left: {
    title: string;
    onClick: () => void;
  };
  right: {
    title: string;
    onClick: () => void;
  };
}) => {
  return (
    <Backdrop>
      <div className="drop-shadow-md rounded-md bg bg-slate-100 text-gray-700 overflow-hidden">
        <h1 className="text-xl text-center font-medium p-8 pb-6">{title}</h1>
        <div className="w-full flex border-t border-gray-300">
          <button
            className={`border-r border-gray-300 ${classNames.action}`}
            onClick={left.onClick}
          >
            {left.title}
          </button>
          <button className={classNames.action} onClick={right.onClick}>
            {right.title}
          </button>
        </div>
      </div>
    </Backdrop>
  );
};
