import dynamic from "next/dynamic";

const App = dynamic(
  async () => {
    const { App } = await import("../src/client");
    return App;
  },
  {
    ssr: false,
  }
);

export default function Index() {
  return <App />;
}
