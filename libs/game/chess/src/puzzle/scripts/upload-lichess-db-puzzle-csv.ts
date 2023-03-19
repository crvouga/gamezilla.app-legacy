import { DatabaseConnection } from '@gamezilla/shared/backend';
import { z } from 'zod';
import { PuzzleDatabase, PuzzleRow } from '../puzzle-database';

//
//
// csv file found here:
// https://database.lichess.org/#puzzles
//
//
//

const LichessRow = z.object({
  PuzzleId: z.string(),
  FEN: z.string(),
  Moves: z.string().transform((x) => x.split(' ')),
  Rating: z.string().transform((x) => parseInt(x)),
  RatingDeviation: z.string().transform((x) => parseInt(x)),
  Popularity: z.string().transform((x) => parseInt(x)),
  NbPlays: z.string().transform((x) => parseInt(x)),
  Themes: z.string().transform((x) => x.split(' ')),
  GameUrl: z.string().url(),
  OpeningTags: z.string().transform((x) => x.split(' ')),
});

type LichessRow = z.infer<typeof LichessRow>;

export const uploadLichessDbPuzzleCsv = async ({
  dbConn,
  lichessDbPuzzleCsxPath,
  batchSize = 10_000,
}: {
  dbConn: DatabaseConnection;
  lichessDbPuzzleCsxPath: string;
  batchSize?: number;
}) => {
  if (typeof window !== 'undefined') {
    // Code to run in the browser environment
    console.log('Running in a browser environment');
    return;
  }

  const fs: Awaited<typeof import('fs')> = await require('fs');
  const csv: Awaited<typeof import('csv-parser')> = await require('csv-parser');

  console.log(`reading ${lichessDbPuzzleCsxPath}`);

  const stream = fs.createReadStream(lichessDbPuzzleCsxPath).pipe(csv());

  let batch: PuzzleRow[] = [];

  console.log('starting upload');
  for await (const lichessRow of stream) {
    const parsed = LichessRow.parse(lichessRow);

    const row = lichessRowToRow(parsed);

    batch.push(row);

    if (batch.length < batchSize) {
      continue;
    }

    console.log('insert started');

    const start = Date.now();

    const inserted = await PuzzleDatabase.insertMany({
      dbConn,
      rows: batch,
    });

    const duration = Date.now() - start;

    console.log(
      `${inserted.type} - ${batch.length} rows - ${formatMilliseconds(
        duration
      )}`
    );

    batch = [];

    if (inserted.type === 'Err') {
      console.log(`insert error ${inserted.error}`);
      continue;
    }
  }

  if (batch.length > 0) {
    const inserted = await PuzzleDatabase.insertMany({
      dbConn,
      rows: batch,
    });

    if (inserted.type === 'Err') {
      console.log(`insert error ${inserted.error}`);
    } else {
      console.log('inserted batch');
    }
  }

  console.log('upload done');
};

const formatMilliseconds = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const ms = milliseconds % 1000;

  return `${minutes} min ${seconds} sec ${ms} ms`;
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
