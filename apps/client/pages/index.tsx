import dynamic from 'next/dynamic';

const App = dynamic(
  async () => {
    const { App } = await import('../components/App');
    return App;
  },
  {
    ssr: false,
  }
);

export const Index = () => {
  return <App />;
};

export default Index;
// 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
