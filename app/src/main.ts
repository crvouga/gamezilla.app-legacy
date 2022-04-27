import { Elm } from "./Main.elm";

const app = Elm.Main.init({
  node: document.body,
  flags: null,
});

app.ports.interopFromElm.subscribe((fromElm) => {
  switch (fromElm.tag) {
    case "alert":
      alert(
        `alerting from typescript: \n message from elm: ${fromElm.data.message}`
      );
      break;
  }
});

console.log("HELLO");
