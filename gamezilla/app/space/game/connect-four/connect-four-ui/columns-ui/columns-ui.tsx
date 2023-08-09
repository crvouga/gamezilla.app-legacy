import { Cmd, Transition, easeAttrs } from "gamezilla/core";
import {
  COLUMN_COUNT,
  Columns,
  MAX_COLUMN_HEIGHT,
  PlayerType,
  Win,
  toWins,
  winToId,
} from "../../connect-four";
import { ViewColumnsCanvas } from "./columns-ui-canvas";
import { ViewColumnsSvg } from "./columns-ui-svg";
import { ViewColumnsProps } from "./shared";

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

export type Model = {
  discs: Transition.Model<Disc>;
  wins: Transition.Model<Win>;
};

export function init(columns?: Columns): Model {
  return {
    discs: Transition.init(discsConfig.toId, columns ? toDiscs(columns) : []),
    wins: Transition.init(winsConfig.toId, columns ? toWins(columns) : []),
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
    columns ? toWins(columns) : undefined
  );
  return {
    model: {
      discs: discs.model,
      wins: wins.model,
    },
    cmd: Cmd.batch<Msg>([Cmd.t("discs", discs.cmd), Cmd.t("wins", wins.cmd)]),
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

export type Disc = {
  x: number;
  y: number;
  player: PlayerType;
  id: string;
};

export function toDiscs(columns: Columns): Disc[] {
  const discs: Disc[] = [];
  for (let x = 0; x < columns.length; x++) {
    for (let y = 0; y < (columns[x]?.length ?? 0); y++) {
      const player = columns[x]?.[y];

      if (player) {
        const disc: Disc = {
          id: `${player}-${x}-${y}`,
          x,
          y,
          player,
        };
        discs.push(disc);
      }
    }
  }
  return discs;
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
    console.log("no node");
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
    console.log("no node");
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
  node.style.stroke = "white";

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
