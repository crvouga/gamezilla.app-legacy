import { AppProps } from "next/app";
import Head from "next/head";

import "tailwindcss/tailwind.css";
import "@ionic/react/css/core.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import "../styles/global.css";
import "../styles/variables.css";

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
