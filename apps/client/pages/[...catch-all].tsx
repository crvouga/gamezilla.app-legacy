import dynamic from "next/dynamic";

const App = dynamic(
  async () => {
    const { App } = await import("../components");
    return App;
  },
  {
    ssr: false,
  }
);

export const CatchAll = () => {
  return <App />;
};

export default CatchAll;
