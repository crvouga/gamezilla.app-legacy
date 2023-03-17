create table chess_puzzle (
  puzzle_id TEXT PRIMARY KEY,
  rating NUMERIC
  rating_deviation NUMERIC
  opening_tags ARRAY
  FEN TEXT
  moves ARRAY
  popularity NUMERIC
  number_of_plays NUMERIC
  themes ARRAY
  game_URL TEXT
);
