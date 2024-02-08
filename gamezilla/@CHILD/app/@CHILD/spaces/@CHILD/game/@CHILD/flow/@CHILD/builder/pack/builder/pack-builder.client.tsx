import { withId } from "gamezilla/@CHILD/app/@CHILD/spaces/@SHARED/event";
import { APP_SOUND, playSound } from "gamezilla/@CHILD/app/@SHARED/client";
import {
  IconArrowLeftOnRect,
  IconPlus,
  VDom,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { ViewBottomButtonBar } from "../../../../../../@SHARED/game";
import { ClientModule } from "../../builder.core";

const update: ClientModule["update"] = (input) => {
  const { model, msg, ctx, msgGame } = input;

  switch (msg?.t) {
    case "pack-builder/user-clicked-exit-button": {
      return {
        model,
        msgGame: [
          withId({ t: "user-exited-pack-builder", userId: ctx.currentUserId }),
        ],
      };
    }
  }

  switch (msgGame?.t) {
    case "user-exited-pack-builder": {
      return {
        model,
        msgCmd: [playSound(APP_SOUND.navBackwardMin)],
      };
    }
  }

  return { model };
};

const View: ClientModule["View"] = (input) => {
  const { dispatch, modelGame } = input;

  if (modelGame.t !== "pack-builder") {
    return null;
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <div className="flex w-full flex-1 flex-col">
        <p className="w-full p-3 text-3xl font-bold">{modelGame.pack.name}</p>
        <div className="flex w-full flex-1 flex-col items-center justify-center">
          <ViewPackPuzzleGrid
            renderCell={({ x, y }) => {
              const index = y * COLUMN_COUNT + x;

              if (index === 0) {
                return (
                  <ViewAddCell
                    onClick={() => {
                      //
                    }}
                  />
                );
              }

              return <ViewEmptyCell />;
            }}
          />
        </div>
      </div>
      <ViewBottomButtonBar
        actions={[
          {
            icon: <IconArrowLeftOnRect className="h-6 w-6" />,
            label: "Exit",
            onClick: () =>
              dispatch({ t: "pack-builder/user-clicked-exit-button" }),
          },
        ]}
      />
    </div>
  );
};

const COLUMN_COUNT = 6;
const ROW_COUNT = 6;

const ViewPackPuzzleGrid = ({
  renderCell,
}: {
  renderCell: ({ x, y }: { x: number; y: number }) => VDom;
}) => {
  const columns: VDom[] = [];
  for (let y = 0; y < ROW_COUNT; y++) {
    const row: VDom[] = [];
    for (let x = 0; x < COLUMN_COUNT; x++) {
      row.push(
        <div
          key={`${y}-${x}`}
          className="flex aspect-square w-1/6 items-center justify-center p-1"
        >
          {renderCell({ x, y })}
        </div>
      );
    }

    columns.push(
      <div key={y} className="flex w-full justify-between">
        {row}
      </div>
    );
  }

  return <div className="w-full p-8">{columns}</div>;
};

const ViewAddCell = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="flex h-full w-full items-center justify-center overflow-hidden rounded border-2 border-neutral-700 bg-neutral-800 hover:opacity-90 active:opacity-80"
    >
      <IconPlus className="h-8 w-8" />
    </button>
  );
};

const ViewEmptyCell = () => {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden rounded border-2 border-neutral-700 bg-neutral-800 opacity-70"></div>
  );
};

export const PackBuilderClient = {
  update,
  View,
};
