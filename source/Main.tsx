import * as ReactDomClient from "react-dom/client";
import { Browser } from "Core";
import { useEffect } from "react";
import * as App from "./App";
import * as ReduxDevTools from "./Core/Debug/ReduxDevTools";

//
//
//
// Main
//
//
//

const program = ReduxDevTools.withDebugger(
  Browser.Application({
    onLocationChange: App.onLocationChange,
    init: App.init,
    update: App.update,
    subscriptions: App.subscriptions,
    view: App.view,
  }),
);

const container = document.getElementById("root");

const root = ReactDomClient.createRoot(container!);

const CleanUp = () => {
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);
  return <div />;
};

const stop = Browser.run(program, (dom) => {
  root.render(
    <>
      {dom}
      <CleanUp />
    </>,
  );
});

program.state$.subscribe((state) => {
  const size = new TextEncoder().encode(JSON.stringify(state.model)).length;
  const kiloBytes = Math.round(size / 1024);
  // const megaBytes = kiloBytes / 1024;
  console.log(`[app] model memory size is ${kiloBytes} kiloBytes`);
});

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(stop);
}
