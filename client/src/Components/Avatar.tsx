import * as Icons from "./Icons";
export const Avatar = ({
  src,
  className = "w-12 h-12",
}: {
  src?: string;
  className?: string;
}) => {
  return (
    <div
      className={`relative border rounded-full p-2 overflow-hidden ${className}`}
    >
      {src ? (
        <img src={src} />
      ) : (
        <Icons.User className="w-full h-full bg-gray-400" />
      )}
    </div>
  );
};
