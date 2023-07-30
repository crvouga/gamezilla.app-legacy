import { Cmd, TransitionList, easeAttrs } from "@gamezilla/core";
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
import { ViewColumnsDOM } from "./columns-ui-react-dom";
import { ViewColumnsSvg } from "./columns-ui-svg";
import { ViewColumnsProps } from "./shared";

//
//
//
//
//

const discsConfig = TransitionList.config<Disc>({
  toId: (disc) => disc.id,
  enter: discEnter,
  exit: discExit,
});

const winsConfig = TransitionList.config<Win>({
  toId: winToId,
  enter: draw,
  exit: undraw,
});

//
//
//
//
//
//

export type Model = {
  discs: TransitionList.Model<Disc>;
  wins: TransitionList.Model<Win>;
};

export function init(columns?: Columns): Model {
  return {
    discs: TransitionList.init(columns ? toDiscs(columns) : []),
    wins: TransitionList.init(columns ? toWins(columns) : []),
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
  | { t: "discs"; c: TransitionList.Msg<Disc> }
  | { t: "wins"; c: TransitionList.Msg<Win> };

export function update({
  msg,
  model,
  columns,
}: {
  columns?: Columns;
  msg?: Msg;
  model?: Model;
}): {
  model?: Model;
  cmd?: Cmd<Msg>;
} {
  if (!model || !columns) {
    return { model };
  }
  const discs = TransitionList.update<Disc>({
    msg: msg?.t === "discs" ? msg.c : undefined,
    model: model.discs,
    config: discsConfig,
    list: toDiscs(columns),
  });
  const wins = TransitionList.update<Win>({
    msg: msg?.t === "wins" ? msg.c : undefined,
    model: model.wins,
    config: winsConfig,
    list: toWins(columns),
  });
  return {
    model: {
      discs: discs.model,
      wins: wins.model,
    },
    cmd: Cmd.batch<Msg>([
      Cmd.tag_("discs", discs.cmd),
      Cmd.tag_("wins", wins.cmd),
    ]),
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
  implementation?: "svg" | "canvas" | "dom";
}) {
  switch (implementation) {
    case "canvas": {
      return <ViewColumnsCanvas {...props} />;
    }

    case "svg": {
      return <ViewColumnsSvg {...props} />;
    }

    case "dom": {
      return <ViewColumnsDOM {...props} />;
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
  const { y } = disc;
  const node = document.getElementById(disc.id);
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
  const { x, y } = disc;
  const node = document.getElementById(disc.id);

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

  const node = document.getElementById(id);

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

  const node = document.getElementById(id);

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
