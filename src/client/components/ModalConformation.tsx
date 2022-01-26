import { Backdrop } from "./Backdrop";

const classNames = {
  action: "flex-1 p-4 uppercase font-bold hover:opacity-70 active:opacity-50",
};

export const ModalConformation = ({
  title,
  left,
  right,
  onBackdropClick,
}: {
  title: string;
  onBackdropClick?: () => void;
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
    <Backdrop className="p-4" onClick={onBackdropClick}>
      <div
        onClick={(event) => {
          event.stopPropagation();
        }}
        className="drop-shadow-md rounded-md bg bg-slate-100 text-gray-700 overflow-hidden"
      >
        <h1 className="text-xl text-center font-bold p-6">{title}</h1>
        <div className="w-full flex border-t border-gray-300">
          <button
            className={`border-r border-gray-300 ${classNames.action}`}
            onClick={left.onClick}
          >
            {left.title}
          </button>
          <button
            className={`text-green-500 ${classNames.action}`}
            onClick={right.onClick}
          >
            {right.title}
          </button>
        </div>
      </div>
    </Backdrop>
  );
};
