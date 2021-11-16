import dynamic from "next/dynamic";

const _Index = dynamic(
  async () => {
    const { Index } = await import("../components/routes/index");
    return Index;
  },
  {
    ssr: false,
  }
);

export const Index = () => {
  return <_Index />;
};

export default Index;
