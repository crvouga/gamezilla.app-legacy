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
      className={`relative border rounded-full overflow-hidden ${className}`}
    >
      {src ? (
        <img width="100%" height="100%" src={src} />
      ) : (
        <Icons.User className="w-full h-full bg-gray-400" />
      )}
    </div>
  );
};
