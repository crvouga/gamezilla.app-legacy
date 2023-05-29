import { cn } from "../utils";

export const LoadingBar = (props: { className?: string }) => {
  return (
    <div
      className={cn(
        "overflow-hidden h-2 mb-4 text-xs flex rounded",
        props.className
      )}>
      <style>
        {`

        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .loading-bar {
          width: 50%;
          animation: loading 0.75s ease-in-out infinite;
        }

        `}
      </style>
      <div className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 loading-bar"></div>
    </div>
  );
};
