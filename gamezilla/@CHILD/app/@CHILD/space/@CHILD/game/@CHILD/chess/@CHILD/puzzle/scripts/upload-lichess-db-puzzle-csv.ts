import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { PuzzleDb, PuzzleRow } from "../puzzle-db/puzzle-db-impl";
import { Parsing as P } from "gamezilla/@SHARED/parsing";

//
//
// csv file found here:
// https://database.lichess.org/#puzzles
//
//
//

export type LichessRow = {
  PuzzleId: string;
  FEN: string;
  Moves: string;
  Rating: string;
  RatingDeviation: string;
  Popularity: string;
  NbPlays: string;
  Themes: string;
  GameUrl: string;
  OpeningTags: string;
};

export const toLichessRow = (x: unknown): LichessRow | null => {
  if (
    P.obj(x) &&
    P.has(x, "PuzzleId", P.str) &&
    P.has(x, "FEN", P.str) &&
    P.has(x, "Moves", P.str) &&
    P.has(x, "Rating", P.str) &&
    P.has(x, "RatingDeviation", P.str) &&
    P.has(x, "Popularity", P.str) &&
    P.has(x, "NbPlays", P.str) &&
    P.has(x, "Themes", P.str) &&
    P.has(x, "GameUrl", P.str) &&
    P.has(x, "OpeningTags", P.str)
  ) {
    return x;
  }

  return null;
};

export const uploadLichessDbPuzzleCsv = async ({
  dbConn,
  lichessDbPuzzleCsvPath,
  batchSize = 10_000,
}: {
  dbConn: DbConnSql;
  lichessDbPuzzleCsvPath: string;
  batchSize?: number;
}) => {
  if (typeof window !== "undefined") {
    // Code to run in the browser environment
    console.log("Running in a browser environment");
    return;
  }

  console.log(`reading ${lichessDbPuzzleCsvPath}`);

  const file = Bun.file(lichessDbPuzzleCsvPath);

  if (await file.exists()) {
    console.log(`file ${lichessDbPuzzleCsvPath} does not exist`);
    return;
  }

  console.error(`not implemented`);

  let batch: PuzzleRow[] = [];

  console.log("starting upload");
  for await (const lichessRow of []) {
    const parsed = toLichessRow(lichessRow);
    if (!parsed) {
      continue;
    }
    const row = lichessRowToRow(parsed);

    batch.push(row);

    if (batch.length < batchSize) {
      continue;
    }

    console.log("insert started");

    const inserted = await PuzzleDb.puzzles.replace({
      dbConn,
      rows: batch,
    });

    console.log(`${inserted.t} - ${batch.length} rows -`);

    batch = [];

    if (inserted.t === "err") {
      console.log(`insert error ${inserted.error}`);
      continue;
    }
  }

  if (batch.length > 0) {
    const inserted = await PuzzleDb.puzzles.replace({
      dbConn,
      rows: batch,
    });

    if (inserted.t === "err") {
      console.log(`insert error ${inserted.error}`);
    } else {
      console.log("inserted batch");
    }
  }

  console.log("upload done");
};

const lichessRowToRow = (lichessRow: LichessRow): PuzzleRow => {
  const {
    PuzzleId,
    FEN,
    Moves,
    Rating,
    RatingDeviation,
    Popularity,
    NbPlays,
    Themes,
    GameUrl,
    OpeningTags,
  } = lichessRow;

  return {
    puzzle_id: PuzzleId,
    rating: Rating,
    rating_deviation: RatingDeviation,
    opening_tags: OpeningTags,
    fen: FEN,
    moves: Moves,
    popularity: Popularity,
    number_of_plays: NbPlays,
    themes: Themes,
    game_url: GameUrl,
  };
};
