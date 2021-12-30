import "../css/build.css";
import { Elm } from "../elm/Main.elm";

document.addEventListener("DOMContentLoaded", () => {
  const app = Elm.Main.init({
    node: document.querySelector("main"),
    flags: {
      message: "hello from ts",
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
