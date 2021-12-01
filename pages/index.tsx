import dynamic from "next/dynamic";

const App = dynamic(
  async () => {
    const { App } = await import("../components/App");
    return App;
  },
  {
    ssr: false,
  }
);

export default function Index() {
  return <App />;
}
