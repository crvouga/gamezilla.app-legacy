import { has, isObj, str } from "gamezilla/@SHARED/core";
import { DbConnSql } from "gamezilla/@CHILD/app/@SHARED/server";
import { PuzzleDb, PuzzleRow } from "../puzzle-db/puzzle-db-impl";

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
    isObj(x) &&
    has(x, "PuzzleId", str) &&
    has(x, "FEN", str) &&
    has(x, "Moves", str) &&
    has(x, "Rating", str) &&
    has(x, "RatingDeviation", str) &&
    has(x, "Popularity", str) &&
    has(x, "NbPlays", str) &&
    has(x, "Themes", str) &&
    has(x, "GameUrl", str) &&
    has(x, "OpeningTags", str)
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

  const fs: Awaited<typeof import("fs")> = await require("fs");
  const csv: Awaited<typeof import("csv-parser")> = await require("csv-parser");

  console.log(`reading ${lichessDbPuzzleCsvPath}`);

  const stream = fs.createReadStream(lichessDbPuzzleCsvPath).pipe(csv());

  let batch: PuzzleRow[] = [];

  console.log("starting upload");
  for await (const lichessRow of stream) {
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
