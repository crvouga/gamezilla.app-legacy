import { Eff, Transition, easeAttrs } from "gamezilla/@SHARED/core";
import {
  COLUMN_COUNT,
  Columns,
  MAX_COLUMN_HEIGHT,
  Win,
  findWins,
  winToId,
} from "../../connect-four";
import "./columns-element";
import { ViewColumnsCanvas } from "./columns-ui-canvas";
import { ViewColumnsSvg } from "./columns-ui-svg";
import {
  Disc,
  Model as SharedModel,
  ViewColumnsProps,
  toDiscs,
} from "./shared";

export type Model = SharedModel;

//
//
//
//
//

const discsConfig = Transition.config<Disc>({
  toId: (disc) => disc.id,
  enter: discEnter,
  exit: discExit,
});

const winsConfig = Transition.config<Win>({
  toId: winToId,
  enter: draw,
  exit: undraw,
});

const rootId = "connect-four-columns-svg";

//
//
//
//
//
//

export function init(columns?: Columns): Model {
  return {
    discs: Transition.init(discsConfig.toId, columns ? toDiscs(columns) : []),
    wins: Transition.init(winsConfig.toId, columns ? findWins(columns) : []),
  };
}

//
//
//
//
//
//
//

export type Msg =
  | { t: "discs"; c: Transition.Msg }
  | { t: "wins"; c: Transition.Msg };

export function watch(model: Model, columns?: Columns) {
  const discs = Transition.watch<Disc>(
    discsConfig,
    model.discs,
    columns ? toDiscs(columns) : undefined
  );
  const wins = Transition.watch<Win>(
    winsConfig,
    model.wins,
    columns ? findWins(columns) : undefined
  );
  return {
    model: {
      discs: discs.model,
      wins: wins.model,
    },
    eff: Eff.batch<Msg>([Eff.t("discs", discs.eff), Eff.t("wins", wins.eff)]),
  };
}

export function update(model: Model, msg: Msg) {
  const discs = Transition.update<Disc>(
    model.discs,
    msg.t === "discs" ? msg.c : undefined
  );
  const wins = Transition.update<Win>(
    model.wins,
    msg.t === "wins" ? msg.c : undefined
  );
  return {
    discs: discs,
    wins: wins,
  };
}

//
//
//
//
//
//
//

export function View({
  implementation = "svg",
  ...props
}: ViewColumnsProps & {
  implementation?: "svg" | "canvas";
}) {
  switch (implementation) {
    case "canvas": {
      return <ViewColumnsCanvas {...props} />;
    }

    case "svg": {
      return <ViewColumnsSvg id={rootId} {...props} />;
    }
  }
}

//
//
//
//
//
//
//
//

async function discEnter(disc: Disc) {
  const { y, id } = disc;

  const node = await Transition.waitForElementById(id, rootId);

  if (!node) {
    return;
  }
  await easeAttrs(node, {
    cy: {
      from: MAX_COLUMN_HEIGHT + 1,
      to: y,
      duration: 200 + 300 * (1 - y / MAX_COLUMN_HEIGHT),
      easing: { type: "ease-out-quint" },
    },
  });
}

async function discExit(disc: Disc) {
  const { x, y, id } = disc;

  const node = await Transition.waitForElementById(id, rootId);

  if (!node) {
    return;
  }

  await easeAttrs(node, {
    cy: {
      from: y,
      to: y - MAX_COLUMN_HEIGHT,
      duration: 750,
      easing: { type: "ease-in-back" },
      delay: (x / COLUMN_COUNT) * 500,
    },
  });
}

async function draw(win: Win) {
  const id = winToId(win);

  const node = await Transition.waitForElementById(id, rootId);

  if (!(node instanceof SVGRectElement)) {
    console.log("no node");
    return;
  }

  const length = node.getTotalLength();
  node.style.strokeDasharray = length.toString();
  node.style.strokeDashoffset = length.toString();
  node.style.stroke = "#fff";

  const animation = node.animate(
    [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
    {
      duration: 500,
      easing: "ease-in-out",
      fill: "both",
    }
  );

  await animation.finished;
}

async function undraw(win: Win) {
  const id = winToId(win);

  const node = await Transition.waitForElementById(id, rootId);

  if (!(node instanceof SVGRectElement)) {
    console.log("no node");
    return;
  }

  const length = node.getTotalLength();
  node.style.strokeDasharray = length.toString();
  node.style.strokeDashoffset = "0";

  const animation = node.animate(
    [{ strokeDashoffset: 0 }, { strokeDashoffset: length }],
    {
      duration: 500,
      easing: "ease-in-out",
      fill: "both",
    }
  );

  await animation.finished;
}
