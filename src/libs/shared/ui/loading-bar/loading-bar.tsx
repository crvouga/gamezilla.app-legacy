import { cn } from "../utils";
import "./loading-bar.css";

export const LoadingBar = (props: { className?: string }) => {
  return (
    <div
      className={cn(
        "overflow-hidden h-2 mb-4 text-xs flex rounded",
        props.className
      )}>
      <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 loading-bar"></div>
    </div>
  );
};
