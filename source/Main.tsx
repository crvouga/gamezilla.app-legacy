import { createRoot } from "react-dom/client";
import * as App from "./App/App";
import { react } from "./Framework";
import * as DebugNavigation from "./Framework/Debug/Navigation";
import * as Navigation from "./Framework/Navigation";

//
//
//
//
// Main
//
//
//
//

const main = () => {
  const program = Program(
    locationToMsg,
    App.init,
    App.update,
    App.view,
    App.subscriptions
  );

  const rootElement = document.getElementById("root");

  if (rootElement) {
    const root = createRoot(rootElement);

    react.run(program, (node) => root.render(node));
  }
};

//
// Location
//

const locationToMsg = (location: Navigation.Location): App.Msg => {
  return {
    type: "LocationChanged",
    location: { pathname: location.pathname },
  };
};

//
// Program
//

const Program =
  process.env.NODE_ENV === "production"
    ? Navigation.program
    : DebugNavigation.programWithDebugger;

//
//
//
//
// Run
//
//
//
//

main();
