import "../css/generated.css";
import { Elm } from "../elm/Main.elm";

document.addEventListener("DOMContentLoaded", () => {
  const app = Elm.Main.init({
    node: document.querySelector("main"),
    flags: {
      greeting: "Greetings from TS",
    },
  });

  app.ports.interopFromElm.subscribe((fromElm) => {
    switch (fromElm.tag) {
      case "alert": {
        alert(fromElm.data.message);
        break;
      }
    }
  });
});
