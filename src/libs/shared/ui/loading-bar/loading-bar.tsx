import { cn } from "../utils";

export const LoadingBar = (props: {
  disabled?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex h-2  overflow-hidden rounded text-xs",
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
      <div
        className={cn(
          "flex flex-col justify-center whitespace-nowrap bg-blue-500 text-center text-white shadow-none",
          !props.disabled && "loading-bar"
        )}></div>
    </div>
  );
};
