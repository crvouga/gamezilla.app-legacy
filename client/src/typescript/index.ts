import { Elm } from "../elm/Main.elm";

const app = Elm.Main.init({
  node: document.querySelector("main"),
  flags: {
    changed: "Greetings from TS",
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
