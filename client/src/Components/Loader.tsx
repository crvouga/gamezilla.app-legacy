export const Loader = ({ className }: { className?: string }) => {
  return (
    <div
      className={`animate-spin rounded-full border-slate-300 border-t-blue-500 w-10 h-10 ${className}`}
      style={{ borderWidth: "6px" }}
    />
  );
};
