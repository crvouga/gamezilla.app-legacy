import { cn } from "./utils";

export const MyAvatar = ({
  className,
  src,
  alt,
  onClick,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  onClick?: () => void;
}) => {
  if (src) {
    return (
      <img
        onClick={onClick}
        src={src}
        alt={alt ?? "user avatar"}
        className={cn(
          `inline-block aspect-square h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-white/40`,
          className
        )}></img>
    );
  }

  return (
    <span
      onClick={onClick}
      className={`inline-block aspect-square h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-white/40 ${className}`}>
      <svg
        className="h-full w-full text-gray-300"
        fill="currentColor"
        viewBox="0 0 24 24">
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </span>
  );
};
