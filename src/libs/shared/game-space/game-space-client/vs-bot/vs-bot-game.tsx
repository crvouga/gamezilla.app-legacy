import { Cmd, TransitionList } from "@gamezilla/core";

const gameOverOverlayId = (value: boolean) =>
  value ? "overlay" : "overlay-hidden";

const overlayConfig = TransitionList.config<boolean>({
  toId: gameOverOverlayId,
  enter: (val) => fadeIn(gameOverOverlayId(val)),
  exit: (val) => fadeOut(gameOverOverlayId(val)),
});

export type Model = {
  gameOverOverlayOpen: TransitionList.Model<boolean>;
};

export const init: Model = {
  gameOverOverlayOpen: TransitionList.init([false]),
};

export type Msg = { t: "overlay"; c: TransitionList.Msg<boolean> };

export function update({
  msg,
  model,
  overlay,
}: {
  overlay: boolean;
  msg: Msg;
  model: Model;
}) {
  const overlayUpdated = TransitionList.update({
    msg: msg.c,
    model: model.gameOverOverlayOpen,
    config: overlayConfig,
    list: [overlay],
  });

  return {
    model: {
      ...model,
      overlay: overlayUpdated.model,
    },
    cmd: Cmd.batch<Msg>([Cmd.tag_("overlay", overlayUpdated.cmd)]),
  };
}

async function fadeIn(id: string) {
  const node = document.getElementById(id);
  if (!node) {
    return;
  }
  await node.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 200,
    easing: "ease-in-out",
    fill: "both",
  }).finished;
}

async function fadeOut(id: string) {
  const node = document.getElementById(id);
  if (!node) {
    return;
  }
  await node.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 200,
    easing: "ease-in-out",
    fill: "both",
  }).finished;
}
