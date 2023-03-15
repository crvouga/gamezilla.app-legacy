export type PuzzleDatabase = {
  findMany: (query: PuzzleQuery) => Promise<Puzzle[]>;
};

type PuzzleQuery = {
  puzzleId?: string;
};

type Puzzle = {
  puzzleId: string;
  FEN: string;
  moves: string[];
  rating: number;
  ratingDeviation: number;
  popularity: number;
  nbPlays: number;
  themes: string[];
  gameUrl: string;
  openingTags: string[];
};

export type PuzzleCompleted = {
  puzzleId: string;
  userId: string;
  seconds: number;
};
