import { Icons } from "./Icons";

export const Avatar = ({
  src,
  className = "w-12 h-12",
}: {
  src?: string;
  className?: string;
}) => {
  return (
    <div
      className={`relative border aspect-square rounded-full overflow-hidden ${className}`}
    >
      {src ? (
        <img
          className="absolute top-0 bottom-0 left-0 right-0"
          width="100%"
          height="100%"
          src={src}
        />
      ) : (
        <Icons.User className="w-full h-full bg-gray-400" />
      )}
    </div>
  );
};
