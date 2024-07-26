import {Err, NonEmpty, Ok, Result, Uuid} from 'gamezilla-app/@/core';
import {p} from 'gamezilla-app/@/core/parser';
import {UserId} from 'gamezilla-app/app/@/data';
import type {IDbConnSql} from 'gamezilla-app/app/@/server/db-conn-sql';
import {type MoveInput, uciMoveToMoveInput} from '../../@/chess';
import {EloRating} from '../elo-rating';
import {
	type Puzzle,
	type PuzzleInteraction,
	type PuzzleProfile,
	initQuery,
} from '../puzzle.types';
import {splitEvery} from '../utils';

//
//
//
// Model
//
//
//

export const Int = p.or(p.str, p.num);

export const PuzzleRow = p.obj({
	puzzle_id: p.str,
	rating: Int,
	rating_deviation: Int,
	opening_tags: p.str,
	fen: p.str,
	moves: p.str,
	popularity: Int,
	number_of_plays: Int,
	themes: p.str,
	game_url: p.str,
});

export type PuzzleRow = p.Infer<typeof PuzzleRow>;

export const PuzzleInteractionRow = p.obj({
	id: p.str,
	puzzle_id: p.str,
	user_id: p.str,
	type: p.enumeration([
		'started',
		'solved',
		'incorrect',
		'solved-with-hint',
	] as const),
});

export type PuzzleInteractionRow = p.Infer<typeof PuzzleInteractionRow>;

const PuzzleQueryJSON = p.obj({
	ratingRange: p.obj({
		lower: p.num,
		upper: p.num,
	}),
});
type PuzzleQueryJSON = p.Infer<typeof PuzzleQueryJSON>;

export const PuzzleProfileRow = p.obj({
	id: p.str,
	user_id: p.str,
	elo_rating: Int,
	puzzle_query: PuzzleQueryJSON,
});

export type PuzzleProfileRow = p.Infer<typeof PuzzleProfileRow>;

//
//
//
//
//
//

const rowToPuzzle = (row: PuzzleRow): Result<string, Puzzle> => {
	const parsedMoves = uciMovesToPuzzleMoves(row.moves.split(' '));

	if (parsedMoves.t === 'err') {
		return parsedMoves;
	}

	const moves = splitEvery(2, parsedMoves.value).flatMap(
		([opponentMove, correctMove]) => {
			if (!opponentMove) {
				return [];
			}
			if (!correctMove) {
				return [];
			}
			return [
				{
					opponentMove,
					correctMove,
				},
			];
		},
	);

	if (!NonEmpty.is(moves)) {
		return Err(
			'Failed to parse moves from puzzle database record',
		);
	}

	if (!EloRating.is(row.rating)) {
		return Err(
			'Failed to parse elo rating from puzzle database record',
		);
	}

	const puzzle: Puzzle = {
		puzzleId: row.puzzle_id,
		fen: row.fen,
		moves,
		rating: row.rating,
		ratingDeviation:
			typeof row.rating_deviation ===
			'string'
				? Number.parseFloat(
						row.rating_deviation,
				  )
				: row.rating_deviation,
		popularity:
			typeof row.popularity ===
			'string'
				? Number.parseInt(
						row.popularity,
				  )
				: row.popularity,
		numberOfPlays:
			typeof row.number_of_plays ===
			'string'
				? Number.parseInt(
						row.number_of_plays,
				  )
				: row.number_of_plays,
		themes: row.themes.split(' '),
		gameUrl: row.game_url,
		openingTags: row.opening_tags.split(' '),
	};

	return Ok(puzzle);
};

export const uciMovesToPuzzleMoves = (
	moves: string[],
): Result<string, [MoveInput, MoveInput, ...MoveInput[]]> => {
	const [move1, move2, ...rest] = moves;
	if (!(move1 && move2)) {
		return Err('Missing first two moves');
	}
	const moveInput1 = uciMoveToMoveInput(move1);
	const moveInput2 = uciMoveToMoveInput(move2);

	if (moveInput1.t === 'err') {
		return moveInput1;
	}

	if (moveInput2.t === 'err') {
		return moveInput2;
	}

	const moveInputRest = Result.combine(
		rest.map(uciMoveToMoveInput),
	);

	if (moveInputRest.t === 'err') {
		return moveInputRest;
	}

	return Ok([
		moveInput1.value,
		moveInput2.value,
		...moveInputRest.value,
	]);
};

const puzzlesFindForProfile = async (
	dbConn: IDbConnSql,
	input: {profile: PuzzleProfile; omit?: string[]},
): Promise<Result<string, Puzzle[]>> => {
	const delta = 100;
	const minRating = input.profile.eloRating - delta;
	const maxRating = input.profile.eloRating + delta;
	const userId = input.profile.userId;
	const omit =
		input.omit?.map((x) => `"${x}"`).join(', ') ??
		null;

	const sql = `
    SELECT
      p.*
    FROM
      game_chess_puzzle p
    WHERE
      NOT EXISTS (
        SELECT 1
        FROM game_chess_puzzle_interaction pi
        WHERE p.puzzle_id = pi.puzzle_id AND pi.user_id = '${userId}'
      )
      AND p.rating BETWEEN ${minRating} AND ${maxRating}
      ${omit ? `AND p.puzzle_id NOT IN (${omit})` : ''}
    ORDER BY
      p.popularity DESC
    LIMIT 1
  `;

	const found = await dbConn.query(PuzzleRow, sql, {});

	if (found.t === 'err') {
		return found;
	}

	const rows = found.value;

	const result = Result.combine(rows.map(rowToPuzzle));

	return result;
};

const puzzlesReplace = async ({
	dbConn,
	rows,
}: {
	dbConn: IDbConnSql;
	rows: PuzzleRow[];
}) => {
	const queryString = `
    REPLACE INTO game_chess_puzzle (
      puzzle_id,
      rating,
      rating_deviation,
      opening_tags,
      fen,
      moves,
      popularity,
      number_of_plays,
      themes,
      game_url
    )
    VALUES
      ${rows.map(
		(row) =>
			`("${row.puzzle_id}", ${row.rating}, ${row.rating_deviation}, "${row.opening_tags}", "${row.fen}", "${row.moves}", ${row.popularity}, ${row.number_of_plays}, "${row.themes}", "${row.game_url}")`,
      )}
  `;

	const inserted = await dbConn.query(PuzzleRow, queryString, {});

	return inserted;
};

const interactionsInsert = async (
	dbConn: IDbConnSql,
	interactions: PuzzleInteraction[],
): Promise<Result<string, null>> => {
	const result = await dbConn.query(
		PuzzleInteractionRow,
		`
        INSERT INTO game_chess_puzzle_interaction (
          puzzle_id,
          user_id,
          type
        ) VALUES ${interactions
		.map(
			(x) =>
				`('${x.puzzleId}', '${x.userId}', '${x.type}')`,
		)
		.join(', ')}
      `,
		{},
	);
	return Result.mapOk(result, () => null);
};

const toPuzzleQueryJSON = (query: unknown): PuzzleQueryJSON | null => {
	if (typeof query !== 'string') {
		return null;
	}
	try {
		const json = JSON.parse(query);
		const parsed = PuzzleQueryJSON.parse(json);
		if (parsed.t === 'err') {
			return null;
		}
		return parsed.value;
	} catch {
		return null;
	}
};
const profilesFind = async (
	dbConn: IDbConnSql,
	userId: UserId,
): Promise<Result<string, PuzzleProfile | null>> => {
	const found = await dbConn.query(
		PuzzleProfileRow,
		`
      SELECT
        *
      FROM
        game_chess_puzzle_profile
      WHERE
        user_id = :user_id
    `,
		{
			user_id: userId,
		},
	);

	if (found.t === 'err') {
		return found;
	}

	const rows = found.value;

	const row = rows[0];

	if (!row) {
		return Ok(null);
	}

	if (!UserId.is(row.user_id)) {
		return Err('Invalid user id');
	}

	if (!EloRating.is(row.elo_rating)) {
		return Err('Invalid elo rating');
	}

	const puzzleQuery = toPuzzleQueryJSON(row.puzzle_query);

	const profile: PuzzleProfile = {
		userId: row.user_id,
		eloRating: row.elo_rating,
		puzzleQuery: {
			ratingRange: [
				puzzleQuery
					?.ratingRange
					.lower ??
					initQuery
						.ratingRange[0],
				puzzleQuery
					?.ratingRange
					.upper ??
					initQuery
						.ratingRange[1],
			],
		},
	};

	return Ok(profile);
};

export const profilesInsert = async (
	dbConn: IDbConnSql,
	profile: PuzzleProfile,
): Promise<Result<string, null>> => {
	const puzzleProfileId = Uuid.generate();

	const mutated = await dbConn.query(
		p.unknown,
		`
        INSERT INTO game_chess_puzzle_profile (
          id,
          user_id,
          elo_rating,
          puzzle_query
        ) VALUES (
          :puzzle_profile_id,
          :user_id,
          :elo_rating,
          :puzzle_query
        )
      `,
		{
			puzzle_profile_id: puzzleProfileId,
			user_id: profile.userId,
			elo_rating: profile.eloRating,
			puzzle_query: JSON.stringify(
				profile.puzzleQuery,
			),
		},
	);

	if (mutated.t === 'err') {
		return mutated;
	}
	return Ok(null);
};

export const profilesFindElseInsert = async (
	dbConn: IDbConnSql,
	profile: PuzzleProfile,
): Promise<Result<string, PuzzleProfile>> => {
	const found = await profilesFind(dbConn, profile.userId);

	if (found.t === 'err') {
		return found;
	}

	if (found.value !== null) {
		return Ok(found.value);
	}

	const inserted = await profilesInsert(dbConn, profile);

	if (inserted.t === 'err') {
		return inserted;
	}

	return Ok(profile);
};

const profilesUpdate = async (
	dbConn: IDbConnSql,
	profile: PuzzleProfile,
): Promise<Result<string, null>> => {
	const mutated = await dbConn.query(
		p.unknown,
		`
      UPDATE game_chess_puzzle_profile
      SET
        user_id = :user_id,
        elo_rating = :elo_rating,
        puzzle_query = :puzzle_query
      WHERE
        user_id = :user_id
    `,
		{
			user_id: profile.userId,
			elo_rating: profile.eloRating,
			puzzle_query: JSON.stringify(
				profile.puzzleQuery,
			),
		},
	);

	if (mutated.t === 'err') {
		return mutated;
	}
	return Ok(null);
};

export const PuzzleDb = {
	interactions: {
		insert: interactionsInsert,
	},
	puzzles: {
		replace: puzzlesReplace,
		findForProfile: puzzlesFindForProfile,
	},
	profiles: {
		find: profilesFind,
		insert: profilesInsert,
		findElseInsert: profilesFindElseInsert,
		update: profilesUpdate,
	},
};
