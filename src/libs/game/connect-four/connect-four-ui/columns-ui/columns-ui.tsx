import { Cmd, TransitionList, easeAttrs } from "@gamezilla/core";
import {
  COLUMN_COUNT,
  Columns,
  MAX_COLUMN_HEIGHT,
  PlayerType,
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
  enter,
  exit,
});

//
//
//
//
//
//

export type Model = {
  discs: TransitionList.Model<Disc>;
};

export const init = (columns?: Columns): Model => {
  return {
    discs: TransitionList.init(columns ? toDiscs(columns) : []),
  };
};

//
//
//
//
//
//
//

export type Msg = { t: "discs"; c: TransitionList.Msg<Disc> };

export const update = ({
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
} => {
  if (!model || !columns) {
    return { model };
  }
  const discs = TransitionList.update<Disc>({
    msg: msg?.t === "discs" ? msg.c : undefined,
    model: model.discs,
    config: discsConfig,
    list: toDiscs(columns),
  });
  return {
    model: {
      discs: discs.model,
    },
    cmd: Cmd.tag_("discs", discs.cmd),
  };
};

export type Disc = {
  x: number;
  y: number;
  player: PlayerType;
  id: string;
};

export const toDiscs = (columns: Columns): Disc[] => {
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
};

//
//
//
//
//
//
//

export const View = ({
  implementation = "svg",
  ...props
}: ViewColumnsProps & {
  implementation?: "svg" | "canvas" | "dom";
}) => {
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
};

//
//
//
//
//
//
//
//

async function enter(disc: Disc) {
  const { y } = disc;
  const node = document.getElementById(disc.id);
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

async function exit(disc: Disc) {
  const { x, y } = disc;
  const node = document.getElementById(disc.id);

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
