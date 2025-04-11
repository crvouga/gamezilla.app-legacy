-- migrate:up
ALTER TABLE game_flow_puzzle
RENAME COLUMN flow_puzzle_name TO name;

ALTER TABLE game_flow_puzzle
RENAME COLUMN flow_solutions TO solutions;


-- migrate:down


ALTER TABLE game_flow_puzzle
RENAME COLUMN name TO flow_puzzle_name;

ALTER TABLE game_flow_puzzle
RENAME COLUMN solutions TO flow_solutions;

