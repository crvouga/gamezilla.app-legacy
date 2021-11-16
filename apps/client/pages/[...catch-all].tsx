import dynamic from "next/dynamic";

const Index = dynamic(
  async () => {
    const { Index } = await import("../components/routes/index");
    return Index;
  },
  {
    ssr: false,
  }
);

export const CatchAll = () => {
  return <Index />;
};

export default CatchAll;
