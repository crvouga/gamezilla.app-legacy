import { AppProps } from 'next/app';
import Head from 'next/head';

const CustomApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Gamezilla</title>
      </Head>

      <Component {...pageProps} />
    </>
  );
};

export default CustomApp;
