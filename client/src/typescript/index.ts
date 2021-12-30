import { Elm } from "../elm/Main.elm";

const app = Elm.Main.init({
  node: document.body,
  flags: {
    greeting: "Greetings from TS",
  },
});

app.ports.interopFromElm.subscribe((fromElm) => {
  switch (fromElm.tag) {
    case "alert": {
      alert("alert from ts");
      break;
    }
  }
});
