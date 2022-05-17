import * as App from "App";
import { createRoot } from "react-dom/client";
import { navigation, react } from "./Framework";
import { programWithDebugger } from "./Framework/Debug/Navigation";

// ███╗   ███╗ █████╗ ██╗███╗   ██╗
// ████╗ ████║██╔══██╗██║████╗  ██║
// ██╔████╔██║███████║██║██╔██╗ ██║
// ██║╚██╔╝██║██╔══██║██║██║╚██╗██║
// ██║ ╚═╝ ██║██║  ██║██║██║ ╚████║
// ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝

const Program =
  process.env.NODE_ENV === "production"
    ? navigation.program
    : programWithDebugger;

export const locationToMsg = (location: navigation.Location): App.Msg => {
  return { group: "Main", type: "LocationChanged", location: location };
};

const program = Program(
  locationToMsg,
  App.init,
  App.update,
  App.view,
  App.subscriptions
);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to get root dom node");
}

const root = createRoot(rootElement);

react.run(program, (dom) => {
  root.render(dom);
});
