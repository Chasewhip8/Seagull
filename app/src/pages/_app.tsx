import { AppProps } from "next/app";
import Head from "next/head";
import { FC } from "react";
import Notifications from "../components/Notification";
import { Provider } from "react-redux";
import { persistor, store } from "../stores/store";
import { AppProviders } from "../provider/AppProviders";
import { PersistGate } from "redux-persist/integration/react";

require("@solana/wallet-adapter-react-ui/styles.css");
require("@fontsource/exo-2");
require("../styles/globals.scss");

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Seagull Finance</title>
        <meta name="description" content="Seagull Finance" />
      </Head>

      <Component {...pageProps} />

      {/* <Provider store={store}> */}
      {/* <PersistGate persistor={persistor}> */}
      {/* <AppProviders> */}
      {/* <Notifications /> */}
      {/* </AppProviders> */}
      {/* </PersistGate> */}
      {/* </Provider> */}
    </>
  );
};

export default App;
