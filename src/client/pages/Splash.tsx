export const Splash = ({ subtitle }: { subtitle?: string }) => {
  return (
    <div className="fixed w-screen h-screen flex flex-col justify-center items-center">
      <div className="text-7xl">🦖</div>
      {subtitle && <div className="text-gray-400 text-lg">{subtitle}</div>}
    </div>
  );
};
